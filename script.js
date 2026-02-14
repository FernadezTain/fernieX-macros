// Состояние приложения
const state = {
    actions: [],
    maxActions: 3,
    triggerValue: ''
};

// Типы действий
const actionTypes = [
    { value: 'send_message', label: 'Отправить сообщение', placeholder: 'Введите текст сообщения' },
    { value: 'send_photo', label: 'Отправить фото', placeholder: 'Введите URL изображения' },
    { value: 'send_sticker', label: 'Отправить стикер', placeholder: 'Введите ID стикера' },
    { value: 'kick_user', label: 'Кикнуть пользователя', placeholder: 'Причина (опционально)' },
    { value: 'mute_user', label: 'Замутить пользователя', placeholder: 'Длительность (например: 1h, 30m)' },
    { value: 'warn_user', label: 'Выдать предупреждение', placeholder: 'Причина предупреждения' },
    { value: 'delete_message', label: 'Удалить сообщение', placeholder: 'Не требует параметров' },
    { value: 'pin_message', label: 'Закрепить сообщение', placeholder: 'Текст для закрепления' },
    { value: 'send_dice', label: 'Отправить кубик', placeholder: 'Тип: dice, dart, basketball' },
    { value: 'add_role', label: 'Выдать роль', placeholder: 'Название роли' },
    { value: 'remove_role', label: 'Забрать роль', placeholder: 'Название роли' },
    { value: 'set_title', label: 'Установить титул', placeholder: 'Новый титул пользователя' }
];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    addAction(); // Добавляем первое действие по умолчанию
});

// Инициализация обработчиков событий
function initEventListeners() {
    const triggerInput = document.getElementById('triggerValue');
    triggerInput.addEventListener('input', handleTriggerValueInput);
    
    // Запрещаем пробелы и спецсимволы
    triggerInput.addEventListener('keypress', (e) => {
        if (e.key === ' ' || /[^a-zA-Zа-яА-ЯёЁ0-9_]/.test(e.key)) {
            e.preventDefault();
        }
    });
    
    document.getElementById('addActionBtn').addEventListener('click', addAction);
    document.getElementById('createMacroBtn').addEventListener('click', createMacro);
    document.getElementById('createNewBtn').addEventListener('click', resetForm);
}

// Обработка ввода значения триггера
function handleTriggerValueInput(e) {
    // Убираем пробелы и спецсимволы
    let value = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ0-9_]/g, '');
    e.target.value = value;
    state.triggerValue = value.trim();
}

// Добавление нового действия
function addAction() {
    if (state.actions.length >= state.maxActions) {
        showNotification('Достигнуто максимальное количество действий (3)', 'warning');
        return;
    }

    const actionId = Date.now();
    const actionNumber = state.actions.length + 1;
    
    state.actions.push({
        id: actionId,
        type: '',
        value: ''
    });

    const actionsContainer = document.getElementById('actionsContainer');
    const actionElement = createActionElement(actionId, actionNumber);
    actionsContainer.appendChild(actionElement);

    // Показать/скрыть кнопку добавления действия
    updateAddActionButton();

    // Анимация появления
    setTimeout(() => {
        actionElement.style.opacity = '1';
        actionElement.style.transform = 'translateX(0)';
    }, 10);
}

// Создание элемента действия
function createActionElement(actionId, actionNumber) {
    const div = document.createElement('div');
    div.className = 'action-item';
    div.id = `action-${actionId}`;
    div.style.opacity = '0';
    div.style.transform = 'translateX(-20px)';
    div.style.transition = 'all 0.4s ease';

    div.innerHTML = `
        <div class="action-header">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div class="action-number">${actionNumber}</div>
                <span class="action-title">Действие ${actionNumber}</span>
            </div>
            ${actionNumber > 1 ? `
                <button class="btn-remove" onclick="removeAction(${actionId})">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            ` : ''}
        </div>
        <div class="form-group">
            <label>Тип действия</label>
            <select class="input-select" onchange="handleActionTypeChange(${actionId}, this.value)">
                <option value="">Выберите действие</option>
                ${actionTypes.map(type => 
                    `<option value="${type.value}">${type.label}</option>`
                ).join('')}
            </select>
        </div>
        <div class="form-group" id="action-value-${actionId}" style="display: none;">
            <label id="action-label-${actionId}">Параметр действия</label>
            <textarea 
                class="input-textarea" 
                id="action-input-${actionId}"
                placeholder="Введите параметр"
                oninput="handleActionValueChange(${actionId}, this.value)"
            ></textarea>
        </div>
    `;

    return div;
}

// Обработка изменения типа действия
function handleActionTypeChange(actionId, actionType) {
    const action = state.actions.find(a => a.id === actionId);
    if (action) {
        action.type = actionType;
        action.value = '';
    }

    const valueGroup = document.getElementById(`action-value-${actionId}`);
    const label = document.getElementById(`action-label-${actionId}`);
    const input = document.getElementById(`action-input-${actionId}`);

    if (actionType) {
        const actionTypeObj = actionTypes.find(t => t.value === actionType);
        valueGroup.style.display = 'block';
        label.textContent = actionTypeObj.label;
        input.placeholder = actionTypeObj.placeholder;
        input.value = '';
    } else {
        valueGroup.style.display = 'none';
    }
}

// Обработка изменения значения действия
function handleActionValueChange(actionId, value) {
    const action = state.actions.find(a => a.id === actionId);
    if (action) {
        action.value = value;
    }
}

// Удаление действия
function removeAction(actionId) {
    const actionElement = document.getElementById(`action-${actionId}`);
    
    // Анимация удаления
    actionElement.style.opacity = '0';
    actionElement.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
        actionElement.remove();
        state.actions = state.actions.filter(a => a.id !== actionId);
        updateActionNumbers();
        updateAddActionButton();
    }, 400);
}

// Обновление номеров действий
function updateActionNumbers() {
    const actionItems = document.querySelectorAll('.action-item');
    actionItems.forEach((item, index) => {
        const number = item.querySelector('.action-number');
        const title = item.querySelector('.action-title');
        if (number) number.textContent = index + 1;
        if (title) title.textContent = `Действие ${index + 1}`;
    });
}

// Обновление кнопки добавления действия
function updateAddActionButton() {
    const addBtn = document.getElementById('addActionBtn');
    
    if (state.actions.length > 0 && state.actions.length < state.maxActions) {
        addBtn.style.display = 'flex';
    } else {
        addBtn.style.display = 'none';
    }
}

// Валидация формы
function validateForm() {
    // Проверка триггера
    if (!state.triggerValue) {
        showNotification('Пожалуйста, укажите команду триггера', 'error');
        document.getElementById('triggerValue').focus();
        return false;
    }

    // Проверка что это одно слово
    if (state.triggerValue.includes(' ')) {
        showNotification('Команда должна быть одним словом без пробелов', 'error');
        document.getElementById('triggerValue').focus();
        return false;
    }

    // Проверка длины
    if (state.triggerValue.length < 2) {
        showNotification('Команда должна содержать минимум 2 символа', 'error');
        document.getElementById('triggerValue').focus();
        return false;
    }

    // Проверка действий
    if (state.actions.length === 0) {
        showNotification('Добавьте хотя бы одно действие', 'error');
        return false;
    }

    // Проверка каждого действия
    for (let i = 0; i < state.actions.length; i++) {
        const action = state.actions[i];
        
        if (!action.type) {
            showNotification(`Выберите тип для действия ${i + 1}`, 'error');
            return false;
        }

        // Некоторые действия не требуют параметров
        const noValueRequired = ['delete_message'];
        if (!noValueRequired.includes(action.type) && !action.value) {
            showNotification(`Укажите параметр для действия ${i + 1}`, 'error');
            return false;
        }
    }

    return true;
}

// Создание макроса
function createMacro() {
    if (!validateForm()) {
        return;
    }

    // Формируем данные макроса
    const macroData = {
        trigger: state.triggerValue,
        actions: state.actions.map(action => ({
            type: action.type,
            value: action.value
        }))
    };

    // Кодируем данные в base64 для передачи в URL
    const encodedData = btoa(encodeURIComponent(JSON.stringify(macroData)));

    // Триггер всегда в формате команды
    const triggerDisplay = `/${state.triggerValue}`;

    // Обновляем превью
    document.getElementById('previewTrigger').textContent = triggerDisplay;
    document.getElementById('previewActionsCount').textContent = state.actions.length;

    // Формируем ссылку на бота
    const botLink = `https://t.me/FernieXBot?start=macro_${encodedData}`;
    document.getElementById('installBtn').href = botLink;

    // Показываем секцию результата
    showResultSection();
}

// Показать секцию результата
function showResultSection() {
    const creatorSection = document.getElementById('creatorSection');
    const resultSection = document.getElementById('resultSection');

    creatorSection.style.opacity = '0';
    creatorSection.style.transform = 'translateY(-20px)';

    setTimeout(() => {
        creatorSection.style.display = 'none';
        resultSection.style.display = 'block';
        
        setTimeout(() => {
            resultSection.style.opacity = '1';
        }, 10);
    }, 300);
}

// Сброс формы
function resetForm() {
    // Очищаем состояние
    state.actions = [];
    state.triggerValue = '';
    
    // Очищаем поля
    document.getElementById('triggerValue').value = '';
    document.getElementById('actionsContainer').innerHTML = '';
    
    // Добавляем первое действие
    addAction();
    
    // Скрываем секцию результата
    const creatorSection = document.getElementById('creatorSection');
    const resultSection = document.getElementById('resultSection');
    
    resultSection.style.opacity = '0';
    
    setTimeout(() => {
        resultSection.style.display = 'none';
        creatorSection.style.display = 'block';
        creatorSection.style.opacity = '1';
        creatorSection.style.transform = 'translateY(0)';
    }, 300);
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#667eea'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавляем стили для анимации уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);
