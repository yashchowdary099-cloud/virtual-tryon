package com.sfit.service;

import com.sfit.dto.chatbot.CartItemDto;
import com.sfit.dto.chatbot.ChatRequest;
import com.sfit.dto.chatbot.ChatResponse;
import com.sfit.dto.chatbot.SizeRecommendationDto;
import com.sfit.model.Product;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);
    private final ProductService productService;

    private static final Pattern CM_PATTERN = Pattern.compile("(\\d+)\\s*(cm|centimeters|centimeter)", Pattern.CASE_INSENSITIVE);
    private static final Pattern PRICE_PATTERN = Pattern.compile("under\\s*₹?\\s*(\\d+)", Pattern.CASE_INSENSITIVE);

    public ChatbotService(ProductService productService) {
        this.productService = productService;
    }

    public ChatResponse processChat(ChatRequest request) {
        String message = request.getMessage() != null ? request.getMessage().trim() : "";
        String query = message.toLowerCase();
        List<CartItemDto> cart = request.getCart() != null ? request.getCart() : new ArrayList<>();

        log.info("[SFit Chatbot] Received query: \"{}\"", message);

        String textResponse;
        List<Product> returnedProducts = null;
        List<String> quickReplies = new ArrayList<>();
        SizeRecommendationDto sizeRecommendation = null;
        boolean showHumanAgent = false;

        Matcher cmMatcher = CM_PATTERN.matcher(query);
        boolean hasCmMatch = cmMatcher.find();

        // INTENT 1: Size Calculation & Measurements
        if (query.contains("size") || query.contains("chest") || query.contains("measurement") || hasCmMatch) {
            int chestVal = 108;
            if (hasCmMatch) {
                try {
                    chestVal = Integer.parseInt(cmMatcher.group(1));
                } catch (NumberFormatException ignored) {}
            } else {
                Matcher digitMatcher = Pattern.compile("(\\d+)").matcher(query);
                if (digitMatcher.find()) {
                    try {
                        chestVal = Integer.parseInt(digitMatcher.group(1));
                    } catch (NumberFormatException ignored) {}
                } else if (request.getUserMeasurements() != null && request.getUserMeasurements().getChestCm() != null) {
                    chestVal = request.getUserMeasurements().getChestCm();
                }
            }

            String calculatedSize;
            String fitCategory;
            if (chestVal < 92) {
                calculatedSize = "S";
                fitCategory = "Slim Fit";
            } else if (chestVal < 100) {
                calculatedSize = "M";
                fitCategory = "Regular Fit";
            } else if (chestVal < 110) {
                calculatedSize = "L";
                fitCategory = "Tailored Fit";
            } else if (chestVal < 118) {
                calculatedSize = "XL";
                fitCategory = "Relaxed Fit";
            } else {
                calculatedSize = "XXL";
                fitCategory = "Comfort Fit";
            }

            textResponse = String.format("Based on a **%d cm chest measurement**, your ideal size is **Size %s** (%s).\n\nI can auto-fill this size for your 3D virtual try-on!", chestVal, calculatedSize, fitCategory);
            
            sizeRecommendation = SizeRecommendationDto.builder()
                    .chestCm(chestVal)
                    .recommendedSize(calculatedSize)
                    .fitCategory(fitCategory)
                    .build();

            quickReplies = List.of("Auto-fill Size " + calculatedSize, "How does 3D try-on work?", "Show shirts in Size " + calculatedSize);
        }
        // INTENT 2: Product Discovery & Price Filter
        else if (query.contains("show") || query.contains("find") || query.contains("shirt") ||
                query.contains("top") || query.contains("under") || query.contains("price") ||
                query.contains("levi") || query.contains("roadster") || query.contains("zara") ||
                query.contains("women") || query.contains("men")) {

            List<Product> allProducts = productService.getAllProducts();
            List<Product> filtered = new ArrayList<>(allProducts);

            // Gender filter
            if (query.contains("women") || query.contains("girl") || query.contains("top")) {
                filtered = filtered.stream()
                        .filter(p -> (p.getGender() != null && p.getGender().equalsIgnoreCase("Women")) ||
                                     (p.getCategory() != null && p.getCategory().contains("Women's")))
                        .collect(Collectors.toList());
            } else if (query.contains("men") || query.contains("boy") || query.contains("shirt")) {
                filtered = filtered.stream()
                        .filter(p -> (p.getGender() != null && p.getGender().equalsIgnoreCase("Men")) ||
                                     (p.getCategory() != null && p.getCategory().contains("Men's")))
                        .collect(Collectors.toList());
            }

            // Price filter
            Matcher priceMatcher = PRICE_PATTERN.matcher(query);
            if (priceMatcher.find()) {
                try {
                    double maxPrice = Double.parseDouble(priceMatcher.group(1));
                    filtered = filtered.stream()
                            .filter(p -> p.getPrice() != null && p.getPrice() <= maxPrice)
                            .collect(Collectors.toList());
                } catch (NumberFormatException ignored) {}
            }

            // Brand filters
            if (query.contains("levi")) {
                filtered = filtered.stream()
                        .filter(p -> p.getBrand() != null && p.getBrand().toLowerCase().contains("levi"))
                        .collect(Collectors.toList());
            }
            if (query.contains("roadster")) {
                filtered = filtered.stream()
                        .filter(p -> p.getBrand() != null && p.getBrand().toLowerCase().contains("roadster"))
                        .collect(Collectors.toList());
            }
            if (query.contains("zara")) {
                filtered = filtered.stream()
                        .filter(p -> p.getBrand() != null && p.getBrand().toLowerCase().contains("zara"))
                        .collect(Collectors.toList());
            }
            if (query.contains("highlander")) {
                filtered = filtered.stream()
                        .filter(p -> p.getBrand() != null && p.getBrand().toLowerCase().contains("highlander"))
                        .collect(Collectors.toList());
            }

            if (!filtered.isEmpty()) {
                returnedProducts = filtered.stream().limit(4).collect(Collectors.toList());
                textResponse = String.format("Here are **%d top options** matching your search from our SFit catalog:", returnedProducts.size());
            } else {
                textResponse = String.format("I couldn't find exact matches for \"%s\", but here are popular bestsellers:", message);
                returnedProducts = allProducts.stream().limit(3).collect(Collectors.toList());
            }

            quickReplies = List.of("Show shirts under ₹1000", "Women's Tops", "Find my size in CM");
        }
        // INTENT 3: Live Shopping Bag & GST Support
        else if (query.contains("cart") || query.contains("bag") || query.contains("gst") || query.contains("total")) {
            if (cart.isEmpty()) {
                textResponse = "Your shopping bag is currently empty. Pick any garment from the catalog to try on or add to bag!";
                quickReplies = List.of("Show Men's Shirts", "Show Women's Tops");
            } else {
                double subtotal = cart.stream()
                        .mapToDouble(item -> (item.getPrice() != null ? item.getPrice() : 0.0) * (item.getQuantity() != null ? item.getQuantity() : 1))
                        .sum();
                long gstAmount = Math.round(subtotal * 0.18);
                long shipping = subtotal >= 1999 ? 0 : 99;
                long grandTotal = Math.round(subtotal) + gstAmount + shipping;

                NumberFormat formatter = NumberFormat.getNumberInstance(new Locale("en", "IN"));

                textResponse = String.format(
                        "🛒 **Your Shopping Bag Summary:**\n• **Items:** %d item(s)\n• **Subtotal:** ₹%s\n• **18%% GST:** ₹%s\n• **Shipping:** %s\n• **Grand Total:** **₹%s**",
                        cart.size(),
                        formatter.format(Math.round(subtotal)),
                        formatter.format(gstAmount),
                        shipping == 0 ? "FREE" : "₹" + shipping,
                        formatter.format(grandTotal)
                );

                quickReplies = List.of("Proceed to Checkout", "Find my size in CM", "Shipping & Delivery info");
            }
        }
        // INTENT 4: Virtual Try-On Guidance
        else if (query.contains("try") || query.contains("how") || query.contains("work") || query.contains("studio")) {
            textResponse = "✨ **How SFit 3D Virtual Try-On Works in 5 Easy Steps:**\n\n1. **Select Garment**: Pick any shirt/top from the catalog & click \"Try It On Me\".\n2. **4-Angle Capture**: Snap or upload 4 photos (Front, Back, Left, Right).\n3. **3D Neural Fitting**: Old clothes are erased & new garment drapes onto your posture.\n4. **3D Results & CM Fit**: Inspect 4-angle views, adjust 3D perspective & verify your size.\n5. **Checkout**: Pay via UPI/Card in ₹ with GST billing!";
            quickReplies = List.of("Find my size in CM", "Show Men's Shirts", "What's in my bag?");
        }
        // INTENT 5: Shipping, Returns & FAQs
        else if (query.contains("ship") || query.contains("deliver") || query.contains("return") || query.contains("pay")) {
            textResponse = "🚚 **SFit Shopping FAQs:**\n\n• **Shipping:** FREE delivery on orders above ₹1,999 (standard delivery ₹99).\n• **Estimated Delivery:** 3–4 business days across India.\n• **Returns:** 7-day hassle-free returns & instant exchange.\n• **Payment:** UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Cash on Delivery.";
            quickReplies = List.of("Track my order", "Find my size in CM", "Show shirts under ₹1000");
        }
        // FALLBACK: Unknown Query
        else {
            textResponse = "I'm here to help you discover clothes, calculate your size in CM, guide virtual try-on, or check your bag. What would you like to explore?";
            showHumanAgent = true;
            quickReplies = List.of("Show shirts under ₹1000", "Find my size in CM", "How does 3D try-on work?", "Talk to Support Agent");
        }

        return ChatResponse.builder()
                .success(true)
                .timestamp(Instant.now().toString())
                .text(textResponse)
                .products(returnedProducts)
                .quickReplies(quickReplies)
                .sizeRecommendation(sizeRecommendation)
                .showHumanAgent(showHumanAgent)
                .build();
    }
}
