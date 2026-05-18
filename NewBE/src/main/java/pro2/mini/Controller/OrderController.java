package pro2.mini.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import pro2.mini.Model.Order;
import pro2.mini.Services.OrderService;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
public class OrderController {
    @Autowired
    private OrderService service;

    @PostMapping("/order/place")
    public Map<String, String> placeOrder() {
        service.placeOrder();
        return Map.of("message", "Order placed successfully");
    }

    @GetMapping("/order")
    public List<Order> getOrder(){
        return service.getOrders();
    }
}
