package pro2.mini.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pro2.mini.Model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem,Long> {
}
