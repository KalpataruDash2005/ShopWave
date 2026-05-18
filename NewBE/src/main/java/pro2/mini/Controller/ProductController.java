package pro2.mini.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pro2.mini.Model.Product;
import pro2.mini.Services.ProductService;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
public class ProductController {
    @Autowired
    ProductService service;

    @GetMapping("/products")
    public List<Product> getAllProduct(){
        return service.getAllProduct();
    }

    @GetMapping("/product/{id}")
    public Product findById(@PathVariable Long id){
        return service.findById(id);
    }

    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product){
        return service.addProduct(product);
    }

    @DeleteMapping("/products/{id}")
    public String deleteProduct(@PathVariable Long id){
        service.deleteProduct(id);
        return "Product deleted Successfully";
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Long id , @RequestBody Product newProduct){
        return service.updateProduct(id,newProduct);
    }

}
