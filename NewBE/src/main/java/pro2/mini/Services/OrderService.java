package pro2.mini.Services;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pro2.mini.Model.Cart;
import pro2.mini.Model.Order;
import pro2.mini.Model.OrderItem;
import pro2.mini.Model.Product;
import pro2.mini.Repository.CartRepository;
import pro2.mini.Repository.OrderItemRepository;
import pro2.mini.Repository.OrderRepository;
import pro2.mini.Repository.ProductRepository;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private CartRepository cartRepo;

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private OrderItemRepository orderItemRepo;

    @Autowired
    private ProductRepository productRepo;

    public String placeOrder() {

        List<Cart> cartItems = cartRepo.findAll();

        if (cartItems.isEmpty()) {
            return "Cart is empty!";
        }

        double total = 0;


        for (Cart item : cartItems) {
            Product product = productRepo.findById(item.getProductId()).orElse(null);
            if (product != null) {
                total += product.getPrice() * item.getQuantity();
            }
        }


        Order order = Order.builder()
                .totalPrice(total)
                .build();

        Order savedOrder = orderRepo.save(order);


        for (Cart item : cartItems) {
            OrderItem orderItem = OrderItem.builder()
                    .orderId(savedOrder.getId())
                    .productId(item.getProductId())
                    .quantity(item.getQuantity())
                    .build();

            orderItemRepo.save(orderItem);
        }


        cartRepo.deleteAll();

        return "Order placed successfully!";
    }

    public List<Order> getOrders() {
        return orderRepo.findAll();
    }
}