package pro2.mini.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pro2.mini.Model.Order;

public interface OrderRepository extends JpaRepository<Order,Long> {
}
