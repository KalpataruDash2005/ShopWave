package pro2.mini.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pro2.mini.Model.Cart;
import pro2.mini.Model.Product;
import pro2.mini.Repository.CartRepository;
import pro2.mini.Repository.ProductRepository;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CartService {
    @Autowired
    private CartRepository repo;
    @Autowired
    private ProductRepository productRepo;

    public Cart addTocart(Cart cart){
        return repo.save(cart);
    }

    public void removeFromCart(Long id){
        repo.deleteAllById(Collections.singleton(id));
    }

    public void clearCart(){
        repo.deleteAll();
    }

    public List<Map<String, Object>> getCartItems() {
        List<Cart> cartItems = repo.findAll();

        return cartItems.stream().map(item -> {

            Product product = productRepo
                    .findById(item.getProductId())
                    .orElse(null);

            Map<String, Object> response = new HashMap<>();

            response.put("id", item.getId());
            response.put("quantity", item.getQuantity());

            if (product != null) {
                response.put("name", product.getName());
                response.put("price", product.getPrice());
            } else {
                response.put("name", "Unknown");
                response.put("price", 0);
            }

            return response;

        }).toList();
    }
}
