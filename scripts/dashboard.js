let goals = JSON.parse(localStorage.getItem('goals')) || [];
let currentFilter = 'all';

const saveGoals = () => localStorage.setItem('goals', JSON.stringify(goals));

// Render goals
const renderGoals = () => {
    const goalList = document.getElementById('goal-list');
    goalList.innerHTML = '';

    const filteredGoals = currentFilter === 'all' ? goals : goals.filter(goal => goal.status === currentFilter);

    filteredGoals.forEach(goal => {
        const goalDiv = document.createElement('div');
        goalDiv.className = 'goal';
        goalDiv.innerHTML = `
            <div>
                <h3>${goal.title}</h3>
                <p>Progress: ${goal.progress}%</p>
            </div>
            <div class="goal-actions">
                <button class="btn secondary edit-goal">Edit</button>
                <button class="btn primary complete-goal">Complete</button>
                <button class="btn secondary delete-goal">Delete</button>
            </div>
        `;

        goalDiv.querySelector('.edit-goal').addEventListener('click', () => openGoalModal(goal));
        goalDiv.querySelector('.complete-goal').addEventListener('click', () => completeGoal(goal));
        goalDiv.querySelector('.delete-goal').addEventListener('click', () => deleteGoal(goal));

        goalList.appendChild(goalDiv);
    });
};

const openGoalModal = (goal = null) => {
    const modal = document.getElementById('goal-modal');
    const modalTitle = document.getElementById('modal-title');
    const titleInput = document.getElementById('goal-title');
    const progressInput = document.getElementById('goal-progress');
    const statusInput = document.getElementById('goal-status');

    if (goal) {
        modalTitle.textContent = 'Edit Goal';
        titleInput.value = goal.title;
        progressInput.value = goal.progress;
        statusInput.value = goal.status;
        titleInput.dataset.editingId = goal.id;
    } else {
        modalTitle.textContent = 'Add Goal';
        titleInput.value = '';
        progressInput.value = '0';
        statusInput.value = 'in-progress';
        titleInput.dataset.editingId = '';
    }

    modal.classList.add('visible');
};

const closeGoalModal = () => {
    document.getElementById('goal-modal').classList.remove('visible');
};

// Save goal
const saveGoal = (e) => {
    e.preventDefault();

    const title = document.getElementById('goal-title').value.trim();
    const progress = parseInt(document.getElementById('goal-progress').value, 10);
    const status = document.getElementById('goal-status').value;
    const editingId = document.getElementById('goal-title').dataset.editingId;

    if (editingId) {
        const goal = goals.find(g => g.id === parseInt(editingId, 10));
        goal.title = title;
        goal.progress = progress;
        goal.status = status;
    } else {
        goals.push({ id: Date.now(), title, progress, status });
    }

    saveGoals();
    renderGoals();
    closeGoalModal();
};

// Complete a goal
const completeGoal = (goal) => {
    goal.status = 'completed';
    goal.progress = 100;
    saveGoals();
    renderGoals();
};

// Delete a goal
const deleteGoal = (goal) => {
    goals = goals.filter(g => g.id !== goal.id);
    saveGoals();
    renderGoals();
};

// Handle filter buttons
const handleFilterClick = (filter) => {
    currentFilter = filter;

    document.querySelectorAll('.btn.filter').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.btn.filter[data-filter="${filter}"]`).classList.add('active');

    renderGoals();
};

// Event Listeners
document.getElementById('add-goal-btn').addEventListener('click', () => openGoalModal());
document.getElementById('goal-form').addEventListener('submit', saveGoal);
document.getElementById('cancel-goal').addEventListener('click', closeGoalModal);
document.querySelectorAll('.btn.filter').forEach(btn => btn.addEventListener('click', () => handleFilterClick(btn.dataset.filter)));

// Initial render
document.addEventListener('DOMContentLoaded', renderGoals);