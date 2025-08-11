// Données stockées localement
let soignants = JSON.parse(localStorage.getItem('soignants')) || [];
let assignments = JSON.parse(localStorage.getItem('assignments')) || {};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initAccueil();
            break;
        case 'chambre.html':
            initChambre();
            break;
        case 'gestion.html':
            initGestion();
            break;
    }
});

// Page d'accueil
function initAccueil() {
    const grid = document.getElementById('chambresGrid');
    if (!grid) return;
    
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'chambre-btn';
        btn.textContent = `Chambre ${i}`;
        
        // Vérifier si la chambre a une équipe assignée
        const equipe = assignments[i];
        if (equipe && equipe.length > 0) {
            btn.classList.add('occupied');
            btn.innerHTML = `Chambre ${i}<br><small>Équipe assignée</small>`;
        }
        
        btn.addEventListener('click', () => {
            window.location.href = `chambre.html?chambre=${i}`;
        });
        
        grid.appendChild(btn);
    }
}

// Page chambre
function initChambre() {
    const urlParams = new URLSearchParams(window.location.search);
    const chambreNum = urlParams.get('chambre');
    
    if (!chambreNum) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('chambreTitle').textContent = `Chambre ${chambreNum}`;
    
    const equipe = assignments[chambreNum] || [];
    const container = document.getElementById('equipeContainer');
    
    if (equipe.length === 0) {
        container.innerHTML = `
            <div class="message-card">
                <h3>Aucune équipe assignée</h3>
                <p>L'équipe de cette chambre n'est pas encore définie. Contactez le personnel pour plus d'informations.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    equipe.forEach(soignantId => {
        const soignant = soignants.find(s => s.id === soignantId);
        if (soignant) {
            const card = createSoignantCard(soignant);
            container.appendChild(card);
        }
    });
}

// Page gestion
function initGestion() {
    const form = document.getElementById('soignantForm');
    const assignerBtn = document.getElementById('assignerBtn');
    
    if (form) {
        form.addEventListener('submit', handleSoignantSubmit);
    }
    
    if (assignerBtn) {
        assignerBtn.addEventListener('click', handleAssignment);
    }
    
    updateSoignantSelect();
    updateAssignmentsList();
}

// Créer une carte soignant
function createSoignantCard(soignant) {
    const card = document.createElement('div');
    card.className = 'soignant-card';
    
    const photoUrl = soignant.photo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRUNGMEYxIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjN0Y4QzhEIi8+CjxwYXRoIGQ9Ik0zMCA5MEM0MCA4MCA4MCA4MCA5MCA5MFYxMjBIMzBWOTBaIiBmaWxsPSIjN0Y4QzhEIi8+Cjwvc3ZnPgo=';
    
    card.innerHTML = `
        <img src="${photoUrl}" alt="${soignant.nom}" class="soignant-photo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRUNGMEYxIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjN0Y4QzhEIi8+CjxwYXRoIGQ9Ik0zMCA5MEM0MCA4MCA4MCA4MCA5MCA5MFYxMjBIMzBWOTBaIiBmaWxsPSIjN0Y4QzhEIi8+Cjwvc3ZnPgo='">
        <div class="soignant-nom">${soignant.nom}</div>
        <div class="soignant-fonction">${soignant.fonction}</div>
        <div class="soignant-description">${soignant.description || 'Aucune description disponible.'}</div>
    `;
    
    return card;
}

// Gérer l'ajout de soignant
function handleSoignantSubmit(e) {
    e.preventDefault();
    
    const nom = document.getElementById('nom').value;
    const fonction = document.getElementById('fonction').value;
    const description = document.getElementById('description').value;
    const photo = document.getElementById('photo').value;
    
    const soignant = {
        id: Date.now().toString(),
        nom,
        fonction,
        description,
        photo
    };
    
    soignants.push(soignant);
    localStorage.setItem('soignants', JSON.stringify(soignants));
    
    // Reset form
    e.target.reset();
    
    // Update select
    updateSoignantSelect();
    
    alert('Soignant ajouté avec succès !');
}

// Gérer l'assignment
function handleAssignment() {
    const soignantId = document.getElementById('soignantSelect').value;
    const chambreNum = document.getElementById('chambreSelect').value;
    
    if (!soignantId || !chambreNum) {
        alert('Veuillez sélectionner un soignant et une chambre.');
        return;
    }
    
    if (!assignments[chambreNum]) {
        assignments[chambreNum] = [];
    }
    
    // Limiter à 3 soignants par chambre
    if (assignments[chambreNum].length >= 3) {
        alert('Cette chambre a déjà 3 soignants assignés.');
        return;
    }
    
    // Vérifier si le soignant n'est pas déjà assigné à cette chambre
    if (assignments[chambreNum].includes(soignantId)) {
        alert('Ce soignant est déjà assigné à cette chambre.');
        return;
    }
    
    assignments[chambreNum].push(soignantId);
    localStorage.setItem('assignments', JSON.stringify(assignments));
    
    // Reset selects
    document.getElementById('soignantSelect').value = '';
    document.getElementById('chambreSelect').value = '';
    
    updateAssignmentsList();
    alert('Assignment effectué avec succès !');
}

// Mettre à jour la liste des soignants
function updateSoignantSelect() {
    const select = document.getElementById('soignantSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Sélectionner un soignant...</option>';
    
    soignants.forEach(soignant => {
        const option = document.createElement('option');
        option.value = soignant.id;
        option.textContent = `${soignant.nom} (${soignant.fonction})`;
        select.appendChild(option);
    });
}

// Mettre à jour la liste des assignments
function updateAssignmentsList() {
    const container = document.getElementById('assignmentsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let chambre = 1; chambre <= 10; chambre++) {
        const equipe = assignments[chambre] || [];
        
        const card = document.createElement('div');
        card.className = 'assignment-card';
        
        let equipeHtml = '';
        equipe.forEach(soignantId => {
            const soignant = soignants.find(s => s.id === soignantId);
            if (soignant) {
                equipeHtml += `
                    <div style="margin-bottom: 0.5rem;">
                        ${soignant.nom} (${soignant.fonction})
                        <button onclick="removeSoignantFromChambre('${soignantId}', '${chambre}')" style="margin-left: 0.5rem; padding: 0.2rem 0.5rem; font-size: 0.8rem; background: #e74c3c;">×</button>
                    </div>
                `;
            }
        });
        
        card.innerHTML = `
            <h4>Chambre ${chambre}</h4>
            ${equipeHtml || '<em>Aucun soignant assigné</em>'}
        `;
        
        container.appendChild(card);
    }
}

// Retirer un soignant d'une chambre
function removeSoignantFromChambre(soignantId, chambre) {
    if (assignments[chambre]) {
        assignments[chambre] = assignments[chambre].filter(id => id !== soignantId);
        if (assignments[chambre].length === 0) {
            delete assignments[chambre];
        }
        localStorage.setItem('assignments', JSON.stringify(assignments));
        updateAssignmentsList();
    }
}
