package com.sfit.controller;

import com.sfit.dto.tryon.TryOnResponse;
import com.sfit.service.TryOnService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/try-on")
public class TryOnController {

    private final TryOnService tryOnService;

    public TryOnController(TryOnService tryOnService) {
        this.tryOnService = tryOnService;
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_OCTET_STREAM_VALUE })
    public ResponseEntity<TryOnResponse> processTryOnMultipart(
            @RequestPart(value = "front", required = false) MultipartFile front,
            @RequestPart(value = "back", required = false) MultipartFile back,
            @RequestPart(value = "left", required = false) MultipartFile left,
            @RequestPart(value = "right", required = false) MultipartFile right,
            @RequestParam(value = "productId", required = false) String productId,
            @RequestParam(value = "preferredSize", required = false) String preferredSize,
            @RequestParam(value = "userSize", required = false) String userSize,
            @RequestParam(value = "garmentImage", required = false) String garmentImage,
            @RequestParam(value = "garmentName", required = false) String garmentName,
            @RequestParam(value = "frontBase64", required = false) String frontBase64,
            HttpServletRequest request) {

        String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                .replacePath(null)
                .build()
                .toUriString();

        TryOnResponse response = tryOnService.processTryOn(
                front, back, left, right,
                productId, preferredSize, userSize, garmentImage, garmentName, frontBase64, baseUrl
        );

        return ResponseEntity.ok(response);
    }
}
