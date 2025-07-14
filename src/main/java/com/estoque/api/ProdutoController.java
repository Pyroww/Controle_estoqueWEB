package com.estoque.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*") // Permite acesso de qualquer origem
public class ProdutoController {

    @Autowired
    private ProdutoRepository repository;

    @GetMapping
    public List<Produto> listarTodos() {
        return repository.findAll();
    }

    @PostMapping
    public Produto criarProduto(@RequestBody Produto produto) {
        return repository.save(produto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizarProduto(@PathVariable Long id, @RequestBody Produto detalhesProduto) {
        return repository.findById(id)
            .map(produto -> {
                produto.setNome(detalhesProduto.getNome());
                produto.setImagemUrl(detalhesProduto.getImagemUrl());
                produto.setQuantidade(detalhesProduto.getQuantidade());
                produto.setVendas(detalhesProduto.getVendas());
                Produto atualizado = repository.save(produto);
                return ResponseEntity.ok(atualizado);
            }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarProduto(@PathVariable Long id) {
        return repository.findById(id)
            .map(produto -> {
                repository.delete(produto);
                return ResponseEntity.ok().build();
            }).orElse(ResponseEntity.notFound().build());
    }
}