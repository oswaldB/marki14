# F02 : Spécifications Techniques - Menu Latéral et Navigation

## Diagrammes Mermaid

### Architecture Globale
```mermaid
flowchart TD
    A[Utilisateur] -->|Desktop| B[Double Sidebar]
    A -->|Mobile| C[Dock Rétractable]
    
    B --> D[Sidebar Icônes]
    B --> E[Sidebar Menu Complet]
    
    D -->|Clique| E
    E -->|Navigation| F[Routeur]
    F --> G[Contenu Principal]
    
    C -->|Toggle| H[Dock Étendu]
    H -->|Sélection| F
    
    E -->|État| I[localStorage]
    C -->|État| I
    
    style A fill:#f9f,stroke:#333
    style B fill:#9f9,stroke:#333
    style C fill:#9f9,stroke:#333
    style F fill:#99f,stroke:#333
    style G fill:#ff9,stroke:#333
```

### Structure des Composants
```mermaid
classDiagram
    class SideMenu {
        +currentPath: string
        +isImpayesOpen: boolean
        +toggleImpayes()
        +initFromLocalStorage()
        +saveToLocalStorage()
    }
    
    class DockComponent {
        +isCollapsed: boolean
        +isAnimating: boolean
        +toggleDock()
        +initFromLocalStorage()
        +saveToLocalStorage()
    }
    
    class MenuItem {
        +id: string
        +label: string
        +icon: string
        +route: string
        +isActive: boolean
        +subItems: MenuItem[]
    }
    
    class BaseLayout {
        +currentPath: string
        +renderSideMenu()
        +renderDock()
    }
    
    SideMenu "1" -- "1" BaseLayout : utilisé par
    DockComponent "1" -- "1" BaseLayout : utilisé par
    MenuItem "1..*" -- "1" SideMenu : contient
