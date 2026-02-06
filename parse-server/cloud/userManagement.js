// Cloud Functions pour la gestion des utilisateurs

// Création d'un nouvel utilisateur
Parse.Cloud.define("createUser", async (request) => {
    const { firstName, lastName, email, password, is_admin } = request.params;
    
    // Validation des paramètres
    if (!firstName || !lastName || !email || !password) {
        throw new Error("Tous les champs sont requis (sauf is_admin)");
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const query = new Parse.Query(Parse.User);
        query.equalTo("email", email);
        const existingUser = await query.first({ useMasterKey: true });
        
        if (existingUser) {
            throw new Error("Un utilisateur avec cet email existe déjà");
        }

        // Créer le nouvel utilisateur
        const user = new Parse.User();
        user.set("username", email); // Utiliser l'email comme username
        user.set("email", email);
        user.set("password", password);
        user.set("firstName", firstName);
        user.set("lastName", lastName);
        user.set("is_admin", is_admin || false);
        user.set("is_active", true); // Par défaut, les nouveaux utilisateurs sont actifs

        // Sauvegarder l'utilisateur
        await user.save(null, { useMasterKey: true });
        
        return {
            success: true,
            message: "Utilisateur créé avec succès",
            userId: user.id
        };
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur:", error);
        throw new Error("Erreur lors de la création de l'utilisateur: " + error.message);
    }
}, { requireMaster: true });

// Mise à jour d'un utilisateur existant
Parse.Cloud.define("updateUser", async (request) => {
    const { objectId, firstName, lastName, email, password, is_admin } = request.params;
    
    // Validation des paramètres
    if (!objectId || !firstName || !lastName || !email) {
        throw new Error("Les champs objectId, firstName, lastName et email sont requis");
    }

    try {
        // Récupérer l'utilisateur
        const query = new Parse.Query(Parse.User);
        const user = await query.get(objectId, { useMasterKey: true });
        
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }

        // Mettre à jour les champs
        user.set("firstName", firstName);
        user.set("lastName", lastName);
        user.set("email", email);
        user.set("username", email); // Mettre à jour le username avec le nouvel email
        user.set("is_admin", is_admin || false);

        // Mettre à jour le mot de passe uniquement s'il est fourni
        if (password && password.trim() !== "") {
            user.set("password", password);
        }

        // Sauvegarder les modifications
        await user.save(null, { useMasterKey: true });
        
        return {
            success: true,
            message: "Utilisateur mis à jour avec succès",
            userId: user.id
        };
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
        throw new Error("Erreur lors de la mise à jour de l'utilisateur: " + error.message);
    }
}, { requireMaster: true });

// Récupérer tous les utilisateurs
Parse.Cloud.define("getAllUsers", async (request) => {
    try {
        const query = new Parse.Query(Parse.User);
        const users = await query.find({ useMasterKey: true });
        
        return users.map(user => ({
            objectId: user.id,
            firstName: user.get("firstName"),
            lastName: user.get("lastName"),
            email: user.get("email"),
            is_admin: user.get("is_admin") || false,
            is_active: user.get("is_active") !== false, // Par défaut, les utilisateurs sont actifs
            createdAt: user.get("createdAt"),
            updatedAt: user.get("updatedAt")
        }));
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        throw new Error("Erreur lors de la récupération des utilisateurs: " + error.message);
    }
}, { requireMaster: true });

// Récupérer les détails d'un utilisateur spécifique
Parse.Cloud.define("getUserDetails", async (request) => {
    const { objectId } = request.params;
    
    if (!objectId) {
        throw new Error("L'ID de l'utilisateur est requis");
    }
    
    try {
        const query = new Parse.Query(Parse.User);
        const user = await query.get(objectId, { useMasterKey: true });
        
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }
        
        return {
            objectId: user.id,
            firstName: user.get("firstName"),
            lastName: user.get("lastName"),
            email: user.get("email"),
            is_admin: user.get("is_admin") || false,
            is_active: user.get("is_active") !== false, // Par défaut, les utilisateurs sont actifs
            createdAt: user.get("createdAt"),
            updatedAt: user.get("updatedAt")
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'utilisateur:", error);
        throw new Error("Erreur lors de la récupération des détails de l'utilisateur: " + error.message);
    }
}, { requireMaster: true });

// Supprimer un utilisateur
Parse.Cloud.define("deleteUser", async (request) => {
    const { objectId } = request.params;
    
    if (!objectId) {
        throw new Error("L'ID de l'utilisateur est requis");
    }
    
    try {
        const query = new Parse.Query(Parse.User);
        const user = await query.get(objectId, { useMasterKey: true });
        
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }
        
        // Supprimer l'utilisateur
        await user.destroy({ useMasterKey: true });
        
        return {
            success: true,
            message: "Utilisateur supprimé avec succès"
        };
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        throw new Error("Erreur lors de la suppression de l'utilisateur: " + error.message);
    }
}, { requireMaster: true });

// Récupérer l'utilisateur actuel
Parse.Cloud.define("getCurrentUser", async (request) => {
    try {
        const user = request.user;
        
        if (!user) {
            throw new Error("Aucun utilisateur connecté");
        }
        
        // Pour accéder à is_active, nous avons besoin de la Master Key
        const userWithMasterKey = await new Parse.Query(Parse.User).get(user.id, { useMasterKey: true });
        
        return {
            objectId: userWithMasterKey.id,
            firstName: userWithMasterKey.get("firstName"),
            lastName: userWithMasterKey.get("lastName"),
            email: userWithMasterKey.get("email"),
            is_admin: userWithMasterKey.get("is_admin") || false,
            is_active: userWithMasterKey.get("is_active") !== false,
            createdAt: userWithMasterKey.get("createdAt"),
            updatedAt: userWithMasterKey.get("updatedAt")
        };
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur actuel:", error);
        throw new Error("Erreur lors de la récupération de l'utilisateur actuel: " + error.message);
    }
}, { requireMaster: true });

// Changer le mot de passe d'un utilisateur
Parse.Cloud.define("changeUserPassword", async (request) => {
    const { objectId, newPassword } = request.params;
    
    if (!objectId || !newPassword) {
        throw new Error("L'ID de l'utilisateur et le nouveau mot de passe sont requis");
    }
    
    try {
        const query = new Parse.Query(Parse.User);
        const user = await query.get(objectId, { useMasterKey: true });
        
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }
        
        // Vérifier que l'utilisateur n'essaie pas de changer son propre mot de passe via cette fonction
        // (sauf s'il s'agit d'un admin qui change son propre mot de passe)
        const currentUser = request.user;
        if (currentUser && currentUser.id === objectId) {
            // C'est l'utilisateur courant, nous devons vérifier qu'il a les droits
            // ou utiliser une fonction dédiée pour le self-service
        }
        
        // Mettre à jour le mot de passe
        user.set("password", newPassword);
        
        // Sauvegarder les modifications
        await user.save(null, { useMasterKey: true });
        
        return {
            success: true,
            message: "Mot de passe changé avec succès"
        };
    } catch (error) {
        console.error("Erreur lors du changement de mot de passe:", error);
        throw new Error("Erreur lors du changement de mot de passe: " + error.message);
    }
}, { requireMaster: true });

// Activer ou désactiver un utilisateur
Parse.Cloud.define("setUserActiveStatus", async (request) => {
    const { objectId, is_active } = request.params;
    
    if (!objectId || typeof is_active !== 'boolean') {
        throw new Error("L'ID de l'utilisateur et le statut sont requis");
    }
    
    try {
        const query = new Parse.Query(Parse.User);
        const user = await query.get(objectId, { useMasterKey: true });
        
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }
        
        // Vérifier que l'utilisateur n'essaie pas de se désactiver lui-même
        const currentUser = request.user;
        if (currentUser && currentUser.id === objectId && !is_active) {
            throw new Error("Vous ne pouvez pas désactiver votre propre compte");
        }
        
        // Mettre à jour le statut actif
        user.set("is_active", is_active);
        
        // Sauvegarder les modifications
        await user.save(null, { useMasterKey: true });
        
        return {
            success: true,
            message: `Utilisateur ${is_active ? 'activé' : 'désactivé'} avec succès`
        };
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut de l'utilisateur:", error);
        throw new Error("Erreur lors de la mise à jour du statut de l'utilisateur: " + error.message);
    }
}, { requireMaster: true });

// Rechercher des utilisateurs
Parse.Cloud.define("searchUsers", async (request) => {
    const { searchTerm } = request.params;
    
    try {
        const query = new Parse.Query(Parse.User);
        
        if (searchTerm && searchTerm.trim() !== "") {
            const searchRegex = new RegExp(searchTerm, "i");
            query.matches("firstName", searchRegex);
            query.matches("lastName", searchRegex);
            query.matches("email", searchRegex);
        }
        
        const users = await query.find({ useMasterKey: true });
        
        return users.map(user => ({
            objectId: user.id,
            firstName: user.get("firstName"),
            lastName: user.get("lastName"),
            email: user.get("email"),
            is_admin: user.get("is_admin") || false,
            is_active: user.get("is_active") !== false // Par défaut, les utilisateurs sont actifs
        }));
    } catch (error) {
        console.error("Erreur lors de la recherche d'utilisateurs:", error);
        throw new Error("Erreur lors de la recherche d'utilisateurs: " + error.message);
    }
}, { requireMaster: true });

// Obtenir les informations complètes de l'utilisateur courant
Parse.Cloud.define("getCurrentUserFullInfo", async (request) => {
    try {
        const user = request.user;
        
        if (!user) {
            throw new Error("Aucun utilisateur connecté");
        }
        
        // Utiliser la Master Key pour accéder à toutes les propriétés, y compris is_active
        const userWithMasterKey = await new Parse.Query(Parse.User).get(user.id, { useMasterKey: true });
        
        return {
            objectId: userWithMasterKey.id,
            firstName: userWithMasterKey.get("firstName"),
            lastName: userWithMasterKey.get("lastName"),
            email: userWithMasterKey.get("email"),
            username: userWithMasterKey.get("username"),
            is_admin: userWithMasterKey.get("is_admin") || false,
            is_active: userWithMasterKey.get("is_active") !== false,
            createdAt: userWithMasterKey.get("createdAt"),
            updatedAt: userWithMasterKey.get("updatedAt"),
            sessionToken: user.getSessionToken()
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des informations complètes de l'utilisateur actuel:", error);
        throw new Error("Erreur lors de la récupération des informations complètes de l'utilisateur actuel: " + error.message);
    }
}, { requireMaster: true });