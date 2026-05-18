package pro2.mini.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pro2.mini.Model.Cart;

public interface CartRepository extends JpaRepository<Cart,Long> {
}
