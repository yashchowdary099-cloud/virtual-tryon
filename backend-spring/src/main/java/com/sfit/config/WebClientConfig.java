package com.sfit.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient(WebClient.Builder builder) {
        // Configure 20MB in-memory buffer limit to handle image data URIs
        final int size = 20 * 1024 * 1024;
        final ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(codecs -> codecs.defaultCodecs().maxInMemorySize(size))
                .build();

        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(60));

        return builder
                .exchangeStrategies(strategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}
