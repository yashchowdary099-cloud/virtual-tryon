package com.sfit.repository;

import com.sfit.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN p.tags t WHERE " +
           "(:category IS NULL OR :category = '' OR :category = 'All' OR LOWER(p.category) = LOWER(:category)) AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(t) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> searchProducts(@Param("category") String category, @Param("search") String search);

    List<Product> findByGenderIgnoreCase(String gender);
}
