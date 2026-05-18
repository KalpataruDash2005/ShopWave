package pro2.mini.Services;
import org.springframework.stereotype.Service;
import pro2.mini.Model.Product;
import pro2.mini.Repository.ProductRepository;

import java.util.List;


@Service
public class ProductService {


    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }
    public List<Product> getAllProduct(){
        return repo.findAll();
    }

    public Product findById(Long id){
        return repo.findById(id).orElse(null);
    }

    public Product addProduct(Product product){
        return repo.save(product);
    }

    public void deleteProduct(Long id){
        repo.deleteById(id);
    }

    public Product updateProduct(Long id , Product newProduct){
        return repo.findById(id).map(exist -> {
            exist.setName(newProduct.getName());
            exist.setPrice(newProduct.getPrice());
            exist.setDescription(newProduct.getDescription());
            exist.setStock(newProduct.getStock());
            exist.setCategory(newProduct.getCategory());
            exist.setImage(newProduct.getImage());
            return repo.save(exist);
        }).orElse(null);
    }

}
