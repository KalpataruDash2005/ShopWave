package pro2.mini.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pro2.mini.Model.Product;

public interface ProductRepository extends JpaRepository<Product,Long> {
}
