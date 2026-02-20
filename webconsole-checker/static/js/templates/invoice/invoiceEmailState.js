/**
 * invoiceEmailState.js - Alpine.js state pour la page d'envoi d'emails avec facture
 * Conforme aux règles de développement du projet
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('invoiceEmailState', () => ({
    // État initial
    invoiceId: '',
    recipientEmail: '',
    recipientName: '',
    emailSubject: '',
    emailPreview: '<p class="text-gray-500 text-center py-8">Aucun aperçu disponible. Cliquez sur "Prévisualiser" pour générer un aperçu.</p>',
    
    showResultModal: false,
    resultSuccess: false,
    resultMessage: '',
    downloadLink: '',
    expiresAt: '',
    
    // Initialisation
    init() {
      // Configuration par défaut
      this.emailSubject = `Votre facture ${this.invoiceId || 'INV-XXXX-XXX'}`;
    },

    // Générer un aperçu de l'email
    generatePreview() {
      if (!this.invoiceId || !this.recipientName) {
        this.emailPreview = '<p class="text-red-500">Veuillez remplir tous les champs obligatoires.</p>';
        return;
      }

      // Générer un aperçu HTML avec Tailwind CSS
      this.emailPreview = `
        <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center mr-3">
              <i class="las la-file-invoice text-white text-sm"></i>
            </div>
            <h1 class="text-xl font-bold text-gray-800">Votre facture</h1>
          </div>
          
          <p class="mb-4 text-gray-700">Bonjour <strong>${this.recipientName}</strong>,</p>
          
          <p class="mb-4 text-gray-700">Votre facture <strong>${this.invoiceId}</strong> est disponible pour téléchargement.</p>
          
          <div class="mb-4">
            <a href="#" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
              <i class="las la-download mr-2"></i>
              Télécharger ${this.invoiceId}.pdf
            </a>
          </div>
          
          <p class="text-sm text-gray-500">Ce lien sera valide pendant 24 heures.</p>
          
          <div class="mt-6 pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-600">Cordialement,</p>
            <p class="text-sm font-medium text-gray-800">L'équipe [Nom de l'entreprise]</p>
          </div>
        </div>
      `;
    },

    // Envoyer l'email avec facture
    async sendInvoiceEmail() {
      if (!this.invoiceId || !this.recipientEmail || !this.recipientName) {
        this.showResultModal = true;
        this.resultSuccess = false;
        this.resultMessage = 'Veuillez remplir tous les champs obligatoires.';
        return;
      }

      try {
        // Appeler le script backend pour vérifier et envoyer
        const response = await Alpine.store('parseAxios').get('/script/invoiceEmail', {
          params: {
            action: 'sendInvoiceEmail',
            invoiceId: this.invoiceId,
            recipientEmail: this.recipientEmail,
            recipientName: this.recipientName,
            emailSubject: this.emailSubject
          }
        });

        if (response.data.success) {
          this.resultSuccess = true;
          this.resultMessage = 'Email envoyé avec succès !';
          this.downloadLink = response.data.downloadLink;
          this.expiresAt = response.data.expiresAt;
        } else {
          this.resultSuccess = false;
          this.resultMessage = response.data.error || 'Échec de l\'envoi de l\'email.';
        }
        
        this.showResultModal = true;
        
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        this.resultSuccess = false;
        this.resultMessage = 'Erreur réseau: ' + (error.message || 'Impossible de contacter le serveur.');
        this.showResultModal = true;
      }
    },

    // Fermer la modale de résultat
    closeResultModal() {
      this.showResultModal = false;
      
      // Réinitialiser pour un nouvel envoi
      if (this.resultSuccess) {
        this.invoiceId = '';
        this.recipientEmail = '';
        this.recipientName = '';
        this.emailSubject = '';
        this.emailPreview = '<p class="text-gray-500 text-center py-8">Aucun aperçu disponible. Cliquez sur "Prévisualiser" pour générer un aperçu.</p>';
      }
    }
  }));
});