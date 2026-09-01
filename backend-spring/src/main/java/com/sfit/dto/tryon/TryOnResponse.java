package com.sfit.dto.tryon;

import java.util.Map;

public class TryOnResponse {
    private boolean success = true;
    private String tryOnId;
    private String timestamp;
    private String productId;
    private int confidenceScore = 96;
    private String recommendedSize;
    private String userSizeVerified;
    private SizeAnalysis sizeAnalysis;
    private BodyMetrics bodyMetrics;
    private Map<String, AngleDetail> angles;
    private String fitSummaryNote;

    public TryOnResponse() {}

    public TryOnResponse(boolean success, String tryOnId, String timestamp, String productId, int confidenceScore, String recommendedSize, String userSizeVerified, SizeAnalysis sizeAnalysis, BodyMetrics bodyMetrics, Map<String, AngleDetail> angles, String fitSummaryNote) {
        this.success = success;
        this.tryOnId = tryOnId;
        this.timestamp = timestamp;
        this.productId = productId;
        this.confidenceScore = confidenceScore;
        this.recommendedSize = recommendedSize;
        this.userSizeVerified = userSizeVerified;
        this.sizeAnalysis = sizeAnalysis;
        this.bodyMetrics = bodyMetrics;
        this.angles = angles;
        this.fitSummaryNote = fitSummaryNote;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private boolean success = true;
        private String tryOnId;
        private String timestamp;
        private String productId;
        private int confidenceScore = 96;
        private String recommendedSize;
        private String userSizeVerified;
        private SizeAnalysis sizeAnalysis;
        private BodyMetrics bodyMetrics;
        private Map<String, AngleDetail> angles;
        private String fitSummaryNote;

        public Builder success(boolean success) { this.success = success; return this; }
        public Builder tryOnId(String tryOnId) { this.tryOnId = tryOnId; return this; }
        public Builder timestamp(String timestamp) { this.timestamp = timestamp; return this; }
        public Builder productId(String productId) { this.productId = productId; return this; }
        public Builder confidenceScore(int score) { this.confidenceScore = score; return this; }
        public Builder recommendedSize(String size) { this.recommendedSize = size; return this; }
        public Builder userSizeVerified(String size) { this.userSizeVerified = size; return this; }
        public Builder sizeAnalysis(SizeAnalysis sa) { this.sizeAnalysis = sa; return this; }
        public Builder bodyMetrics(BodyMetrics bm) { this.bodyMetrics = bm; return this; }
        public Builder angles(Map<String, AngleDetail> angles) { this.angles = angles; return this; }
        public Builder fitSummaryNote(String note) { this.fitSummaryNote = note; return this; }
        public TryOnResponse build() {
            return new TryOnResponse(success, tryOnId, timestamp, productId, confidenceScore, recommendedSize, userSizeVerified, sizeAnalysis, bodyMetrics, angles, fitSummaryNote);
        }
    }

    public static class SizeAnalysis {
        private String recommended;
        private String alternative;
        private String fitCategory;

        public SizeAnalysis() {}

        public SizeAnalysis(String recommended, String alternative, String fitCategory) {
            this.recommended = recommended;
            this.alternative = alternative;
            this.fitCategory = fitCategory;
        }

        public static SizeAnalysisBuilder builder() { return new SizeAnalysisBuilder(); }

        public static class SizeAnalysisBuilder {
            private String recommended;
            private String alternative;
            private String fitCategory;
            public SizeAnalysisBuilder recommended(String rec) { this.recommended = rec; return this; }
            public SizeAnalysisBuilder alternative(String alt) { this.alternative = alt; return this; }
            public SizeAnalysisBuilder fitCategory(String fc) { this.fitCategory = fc; return this; }
            public SizeAnalysis build() { return new SizeAnalysis(recommended, alternative, fitCategory); }
        }

        public String getRecommended() { return recommended; }
        public void setRecommended(String recommended) { this.recommended = recommended; }
        public String getAlternative() { return alternative; }
        public void setAlternative(String alternative) { this.alternative = alternative; }
        public String getFitCategory() { return fitCategory; }
        public void setFitCategory(String fitCategory) { this.fitCategory = fitCategory; }
    }

    public static class BodyMetrics {
        private String chestWidthFit;
        private String waistContourFit;
        private String shoulderSlope;
        private String armSleeveLength;

        public BodyMetrics() {}

        public BodyMetrics(String chestWidthFit, String waistContourFit, String shoulderSlope, String armSleeveLength) {
            this.chestWidthFit = chestWidthFit;
            this.waistContourFit = waistContourFit;
            this.shoulderSlope = shoulderSlope;
            this.armSleeveLength = armSleeveLength;
        }

        public static BodyMetricsBuilder builder() { return new BodyMetricsBuilder(); }

        public static class BodyMetricsBuilder {
            private String chestWidthFit;
            private String waistContourFit;
            private String shoulderSlope;
            private String armSleeveLength;
            public BodyMetricsBuilder chestWidthFit(String v) { this.chestWidthFit = v; return this; }
            public BodyMetricsBuilder waistContourFit(String v) { this.waistContourFit = v; return this; }
            public BodyMetricsBuilder shoulderSlope(String v) { this.shoulderSlope = v; return this; }
            public BodyMetricsBuilder armSleeveLength(String v) { this.armSleeveLength = v; return this; }
            public BodyMetrics build() { return new BodyMetrics(chestWidthFit, waistContourFit, shoulderSlope, armSleeveLength); }
        }

        public String getChestWidthFit() { return chestWidthFit; }
        public void setChestWidthFit(String chestWidthFit) { this.chestWidthFit = chestWidthFit; }
        public String getWaistContourFit() { return waistContourFit; }
        public void setWaistContourFit(String waistContourFit) { this.waistContourFit = waistContourFit; }
        public String getShoulderSlope() { return shoulderSlope; }
        public void setShoulderSlope(String shoulderSlope) { this.shoulderSlope = shoulderSlope; }
        public String getArmSleeveLength() { return armSleeveLength; }
        public void setArmSleeveLength(String armSleeveLength) { this.armSleeveLength = armSleeveLength; }
    }

    public static class AngleDetail {
        private String title;
        private String url;
        private String userUrl;
        private boolean isAiGenerated;
        private String confidence;

        public AngleDetail() {}

        public AngleDetail(String title, String url, String userUrl, boolean isAiGenerated, String confidence) {
            this.title = title;
            this.url = url;
            this.userUrl = userUrl;
            this.isAiGenerated = isAiGenerated;
            this.confidence = confidence;
        }

        public static AngleDetailBuilder builder() { return new AngleDetailBuilder(); }

        public static class AngleDetailBuilder {
            private String title;
            private String url;
            private String userUrl;
            private boolean isAiGenerated;
            private String confidence;
            public AngleDetailBuilder title(String t) { this.title = t; return this; }
            public AngleDetailBuilder url(String u) { this.url = u; return this; }
            public AngleDetailBuilder userUrl(String uu) { this.userUrl = uu; return this; }
            public AngleDetailBuilder isAiGenerated(boolean ai) { this.isAiGenerated = ai; return this; }
            public AngleDetailBuilder confidence(String c) { this.confidence = c; return this; }
            public AngleDetail build() { return new AngleDetail(title, url, userUrl, isAiGenerated, confidence); }
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getUserUrl() { return userUrl; }
        public void setUserUrl(String userUrl) { this.userUrl = userUrl; }
        public boolean isAiGenerated() { return isAiGenerated; }
        public void setAiGenerated(boolean aiGenerated) { isAiGenerated = aiGenerated; }
        public String getConfidence() { return confidence; }
        public void setConfidence(String confidence) { this.confidence = confidence; }
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getTryOnId() { return tryOnId; }
    public void setTryOnId(String tryOnId) { this.tryOnId = tryOnId; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public int getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(int confidenceScore) { this.confidenceScore = confidenceScore; }
    public String getRecommendedSize() { return recommendedSize; }
    public void setRecommendedSize(String recommendedSize) { this.recommendedSize = recommendedSize; }
    public String getUserSizeVerified() { return userSizeVerified; }
    public void setUserSizeVerified(String userSizeVerified) { this.userSizeVerified = userSizeVerified; }
    public SizeAnalysis getSizeAnalysis() { return sizeAnalysis; }
    public void setSizeAnalysis(SizeAnalysis sizeAnalysis) { this.sizeAnalysis = sizeAnalysis; }
    public BodyMetrics getBodyMetrics() { return bodyMetrics; }
    public void setBodyMetrics(BodyMetrics bodyMetrics) { this.bodyMetrics = bodyMetrics; }
    public Map<String, AngleDetail> getAngles() { return angles; }
    public void setAngles(Map<String, AngleDetail> angles) { this.angles = angles; }
    public String getFitSummaryNote() { return fitSummaryNote; }
    public void setFitSummaryNote(String fitSummaryNote) { this.fitSummaryNote = fitSummaryNote; }
}
