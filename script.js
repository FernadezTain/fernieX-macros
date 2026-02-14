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

    // Создаем header
    const header = document.createElement('div');
    header.className = 'action-header';
    
    const headerLeft = document.createElement('div');
    headerLeft.style.display = 'flex';
    headerLeft.style.alignItems = 'center';
    headerLeft.style.gap = '12px';
    
    const numberDiv = document.createElement('div');
    numberDiv.className = 'action-number';
    numberDiv.textContent = actionNumber;
    
    const titleSpan = document.createElement('span');
    titleSpan.className = 'action-title';
    titleSpan.textContent = `Действие ${actionNumber}`;
    
    headerLeft.appendChild(numberDiv);
    headerLeft.appendChild(titleSpan);
    header.appendChild(headerLeft);
    
    if (actionNumber > 1) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-remove';
        removeBtn.onclick = () => removeAction(actionId);
        removeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
        header.appendChild(removeBtn);
    }
    
    div.appendChild(header);
    
    // Создаем form-group для селекта
    const formGroup1 = document.createElement('div');
    formGroup1.className = 'form-group';
    
    const label1 = document.createElement('label');
    label1.textContent = 'Тип действия';
    formGroup1.appendChild(label1);
    
    // Создаем custom select wrapper
    const selectWrapper = document.createElement('div');
    selectWrapper.className = 'custom-select-wrapper';
    
    const customSelect = document.createElement('div');
    customSelect.className = 'custom-select';
    customSelect.onclick = () => toggleCustomSelect(actionId);
    
    const selectText = document.createElement('span');
    selectText.className = 'custom-select-text';
    selectText.id = `select-text-${actionId}`;
    selectText.textContent = 'Выберите действие';
    
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrow.setAttribute('class', 'custom-select-arrow');
    arrow.setAttribute('width', '20');
    arrow.setAttribute('height', '20');
    arrow.setAttribute('viewBox', '0 0 20 20');
    arrow.setAttribute('fill', 'none');
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M5 7.5L10 12.5L15 7.5');
    arrowPath.setAttribute('stroke', 'currentColor');
    arrowPath.setAttribute('stroke-width', '2');
    arrowPath.setAttribute('stroke-linecap', 'round');
    arrowPath.setAttribute('stroke-linejoin', 'round');
    arrow.appendChild(arrowPath);
    
    customSelect.appendChild(selectText);
    customSelect.appendChild(arrow);
    selectWrapper.appendChild(customSelect);
    
    // Создаем options
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'custom-options';
    optionsDiv.id = `options-${actionId}`;
    
    actionTypes.forEach(type => {
        const option = document.createElement('div');
        option.className = 'custom-option';
        option.onclick = () => selectActionType(actionId, type.value, type.label);
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'custom-option-icon';
        iconDiv.textContent = getActionIcon(type.value);
        
        const textDiv = document.createElement('div');
        textDiv.className = 'custom-option-text';
        
        const labelSpan = document.createElement('span');
        labelSpan.className = 'custom-option-label';
        labelSpan.textContent = type.label;
        
        textDiv.appendChild(labelSpan);
        option.appendChild(iconDiv);
        option.appendChild(textDiv);
        optionsDiv.appendChild(option);
    });
    
    selectWrapper.appendChild(optionsDiv);
    formGroup1.appendChild(selectWrapper);
    div.appendChild(formGroup1);
    
    // Создаем form-group для value
    const formGroup2 = document.createElement('div');
    formGroup2.className = 'form-group';
    formGroup2.id = `action-value-${actionId}`;
    formGroup2.style.display = 'none';
    
    const label2 = document.createElement('label');
    label2.id = `action-label-${actionId}`;
    label2.textContent = 'Параметр действия';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'input-textarea';
    textarea.id = `action-input-${actionId}`;
    textarea.placeholder = 'Введите параметр';
    textarea.oninput = (e) => handleActionValueChange(actionId, e.target.value);
    
    formGroup2.appendChild(label2);
    formGroup2.appendChild(textarea);
    div.appendChild(formGroup2);

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

// Получить иконку для типа действия
function getActionIcon(actionType) {
    const icons = {
        'send_message': '💬',
        'send_photo': '🖼️',
        'send_sticker': '🎨',
        'kick_user': '👢',
        'mute_user': '🔇',
        'warn_user': '⚠️',
        'delete_message': '🗑️',
        'pin_message': '📌',
        'send_dice': '🎲',
        'add_role': '⭐',
        'remove_role': '❌',
        'set_title': '👑'
    };
    return icons[actionType] || '⚙️';
}

// Переключение кастомного селекта
function toggleCustomSelect(actionId) {
    const actionItem = document.getElementById(`action-${actionId}`);
    const select = actionItem.querySelector('.custom-select');
    const options = document.getElementById(`options-${actionId}`);
    
    const isCurrentlyActive = select.classList.contains('active');
    
    // Закрываем все остальные селекты и убираем z-index
    document.querySelectorAll('.action-item').forEach(item => {
        item.classList.remove('dropdown-open');
    });
    document.querySelectorAll('.custom-select').forEach(s => {
        s.classList.remove('active');
    });
    document.querySelectorAll('.custom-options').forEach(o => {
        o.classList.remove('active');
    });
    
    // Если селект не был активным, открываем его
    if (!isCurrentlyActive) {
        actionItem.classList.add('dropdown-open');
        select.classList.add('active');
        options.classList.add('active');
    }
}

// Выбор типа действия из кастомного селекта
function selectActionType(actionId, actionType, actionLabel) {
    const actionItem = document.getElementById(`action-${actionId}`);
    const selectText = document.getElementById(`select-text-${actionId}`);
    const select = actionItem.querySelector('.custom-select');
    const options = document.getElementById(`options-${actionId}`);
    
    // Обновляем текст
    selectText.textContent = actionLabel;
    selectText.classList.add('selected');
    
    // Закрываем селект
    select.classList.remove('active');
    options.classList.remove('active');
    actionItem.classList.remove('dropdown-open');
    
    // Вызываем обработчик изменения
    handleActionTypeChange(actionId, actionType);
}

// Закрытие селектов при клике вне их
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
        document.querySelectorAll('.action-item').forEach(item => {
            item.classList.remove('dropdown-open');
        });
        document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.custom-options').forEach(o => o.classList.remove('active'));
    }
});

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
