<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('sequencesState', () => ({
        {% include 'sequences/alpinejs/partials/state_definition.js' %}
        
        {% include 'sequences/alpinejs/partials/lifecycle_methods.js' %}
        
        {% include 'sequences/alpinejs/partials/data_loading_methods.js' %}
        
        {% include 'sequences/alpinejs/partials/filtering_methods.js' %}
        
        {% include 'sequences/alpinejs/partials/utility_methods.js' %}
        
        {% include 'sequences/alpinejs/partials/drawer_management_methods.js' %}
        
        {% include 'sequences/alpinejs/partials/sequence_operations_methods.js' %}
        
        {% include 'sequences/alpinejs/partials/delete_operations_methods.js' %}
        
        {% include 'sequences/alpinejs/partials/pagination_methods.js' %}
    }));
});
</script>