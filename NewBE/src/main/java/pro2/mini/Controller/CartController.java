package pro2.mini.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pro2.mini.Model.Cart;
import pro2.mini.Services.CartService;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
public class CartController {

    @Autowired
    private CartService service;

    @GetMapping("/cart")
    public List<Map<String, Object>> getCart() {
        return service.getCartItems();
    }

    @PostMapping("/cart/add")
    public Cart addTocart(@RequestBody Cart cart){
        return service.addTocart(cart);
    }

    @DeleteMapping("/cart/remove/{id}")
    public Map<String, String> remove(@PathVariable Long id) {
        service.removeFromCart(id);
        return Map.of("message", "Item removed");
    }

    @DeleteMapping("/cart/clear")
    public String clearCart(){
        service.clearCart();
        return "Cart cleared";
    }
}
