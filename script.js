// Состояние приложения
const state = {
    actions: [],
    maxActions: 3,
    triggerValue: '',
    topSelections: {} // Хранение данных о выборе топов для каждого действия
};

// Типы действий
const actionTypes = [
    { value: 'send_message', label: 'Отправить сообщение', placeholder: 'Введите текст сообщения' },
    { value: 'send_photo', label: 'Отправить фото', placeholder: 'Введите URL изображения' },
    { value: 'get_top_position', label: 'Узнать позицию в топе', placeholder: 'Специальное действие', hasSubOptions: true },
];

// Опции для топов
const topOptions = [
    { value: 'balance', label: 'Баланс', hasSubType: false },
    { value: 'charity', label: 'Благотворительность', hasSubType: false },
    { value: 'digital_coins', label: 'Digital Coins', hasSubType: false },
    { value: 'messages', label: 'Сообщения', hasSubType: true, subTypes: [
        { value: 'local', label: 'Локальный Топ' },
        { value: 'global', label: 'Глобальный Топ' }
    ]},
    { value: 'level', label: 'Уровень', hasSubType: false }
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
    arrow.setAttribute('width', '16');
    arrow.setAttribute('height', '16');
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

    if (actionType === 'get_top_position') {
        // Специальная обработка для "Узнать позицию в топе"
        valueGroup.style.display = 'block';
        valueGroup.innerHTML = `
            <label>Выберите тип топа</label>
            <div class="custom-select-wrapper">
                <div class="custom-select" onclick="toggleTopSelect(${actionId})">
                    <span class="custom-select-text" id="top-select-text-${actionId}">Выберите топ</span>
                    <svg class="custom-select-arrow" width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="custom-options" id="top-options-${actionId}"></div>
            </div>
            <div id="top-subtype-${actionId}" style="display: none; margin-top: 12px;">
                <label id="subtype-label-${actionId}">Тип топа сообщений</label>
                <div class="custom-select-wrapper">
                    <div class="custom-select" onclick="toggleTopSubtypeSelect(${actionId})">
                        <span class="custom-select-text" id="top-subtype-text-${actionId}">Выберите тип</span>
                        <svg class="custom-select-arrow" width="16" height="16" viewBox="0 0 20 20" fill="none">
                            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="custom-options" id="top-subtype-options-${actionId}"></div>
                </div>
            </div>
            <div id="top-position-input-${actionId}" style="display: none; margin-top: 12px;">
                <label>Укажите позицию топа, которую нужно найти (Пример: 4)</label>
                <input 
                    type="number" 
                    class="input-field" 
                    placeholder="Например: 4" 
                    min="1"
                    oninput="handleTopPositionInput(${actionId}, this.value)"
                />
            </div>
        `;
        
        // Заполняем опции топов
        const topOptionsContainer = document.getElementById(`top-options-${actionId}`);
        topOptions.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'custom-option';
            optionDiv.onclick = () => selectTopType(actionId, option.value, option.label, option.hasSubType, option.subTypes);
            
            const iconDiv = document.createElement('div');
            iconDiv.className = 'custom-option-icon';
            iconDiv.textContent = getTopIcon(option.value);
            
            const textDiv = document.createElement('div');
            textDiv.className = 'custom-option-text';
            const labelSpan = document.createElement('span');
            labelSpan.className = 'custom-option-label';
            labelSpan.textContent = option.label;
            
            textDiv.appendChild(labelSpan);
            optionDiv.appendChild(iconDiv);
            optionDiv.appendChild(textDiv);
            topOptionsContainer.appendChild(optionDiv);
        });
        
        // Инициализируем данные для этого действия
        if (!state.topSelections[actionId]) {
            state.topSelections[actionId] = {
                topType: null,
                subType: null,
                position: null
            };
        }
    } else if (actionType) {
        const actionTypeObj = actionTypes.find(t => t.value === actionType);
        valueGroup.style.display = 'block';
        
        // Восстанавливаем стандартную структуру
        valueGroup.innerHTML = `
            <label id="action-label-${actionId}">${actionTypeObj.label}</label>
            <textarea 
                class="input-textarea" 
                id="action-input-${actionId}"
                placeholder="${actionTypeObj.placeholder}"
                oninput="handleActionValueChange(${actionId}, this.value)"
            ></textarea>
        `;
    } else {
        valueGroup.style.display = 'none';
    }
}

// Получить иконку для типа топа
function getTopIcon(topType) {
    const icons = {
        'balance': '💰',
        'charity': '❤️',
        'digital_coins': '🪙',
        'messages': '💬',
        'level': '⭐'
    };
    return icons[topType] || '📊';
}

// Переключение селекта типа топа
function toggleTopSelect(actionId) {
    const actionItem = document.getElementById(`action-${actionId}`);
    const select = actionItem.querySelector(`#top-select-text-${actionId}`).parentElement;
    const options = document.getElementById(`top-options-${actionId}`);
    
    const isCurrentlyActive = select.classList.contains('active');
    
    // Закрываем все селекты
    document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.custom-options').forEach(o => o.classList.remove('active'));
    
    if (!isCurrentlyActive) {
        select.classList.add('active');
        options.classList.add('active');
    }
}

// Выбор типа топа
function selectTopType(actionId, topValue, topLabel, hasSubType, subTypes) {
    const selectText = document.getElementById(`top-select-text-${actionId}`);
    const select = selectText.parentElement;
    const options = document.getElementById(`top-options-${actionId}`);
    
    selectText.textContent = topLabel;
    selectText.classList.add('selected');
    select.classList.remove('active');
    options.classList.remove('active');
    
    // Сохраняем выбор
    state.topSelections[actionId].topType = topValue;
    
    // Показываем/скрываем подтип для сообщений
    const subtypeContainer = document.getElementById(`top-subtype-${actionId}`);
    
    if (hasSubType && subTypes) {
        subtypeContainer.style.display = 'block';
        
        // Заполняем опции подтипа
        const subtypeOptionsContainer = document.getElementById(`top-subtype-options-${actionId}`);
        subtypeOptionsContainer.innerHTML = '';
        
        subTypes.forEach(subType => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'custom-option';
            optionDiv.onclick = () => selectTopSubtype(actionId, subType.value, subType.label);
            
            const iconDiv = document.createElement('div');
            iconDiv.className = 'custom-option-icon';
            iconDiv.textContent = subType.value === 'local' ? '🏠' : '🌍';
            
            const textDiv = document.createElement('div');
            textDiv.className = 'custom-option-text';
            const labelSpan = document.createElement('span');
            labelSpan.className = 'custom-option-label';
            labelSpan.textContent = subType.label;
            
            textDiv.appendChild(labelSpan);
            optionDiv.appendChild(iconDiv);
            optionDiv.appendChild(textDiv);
            subtypeOptionsContainer.appendChild(optionDiv);
        });
        
        // Скрываем поле позиции пока не выбран подтип
        document.getElementById(`top-position-input-${actionId}`).style.display = 'none';
    } else {
        subtypeContainer.style.display = 'none';
        state.topSelections[actionId].subType = null;
        
        // Показываем поле позиции сразу
        document.getElementById(`top-position-input-${actionId}`).style.display = 'block';
    }
}

// Переключение селекта подтипа топа
function toggleTopSubtypeSelect(actionId) {
    const select = document.querySelector(`#top-subtype-text-${actionId}`).parentElement;
    const options = document.getElementById(`top-subtype-options-${actionId}`);
    
    const isCurrentlyActive = select.classList.contains('active');
    
    // Закрываем все селекты
    document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.custom-options').forEach(o => o.classList.remove('active'));
    
    if (!isCurrentlyActive) {
        select.classList.add('active');
        options.classList.add('active');
    }
}

// Выбор подтипа топа
function selectTopSubtype(actionId, subtypeValue, subtypeLabel) {
    const selectText = document.getElementById(`top-subtype-text-${actionId}`);
    const select = selectText.parentElement;
    const options = document.getElementById(`top-subtype-options-${actionId}`);
    
    selectText.textContent = subtypeLabel;
    selectText.classList.add('selected');
    select.classList.remove('active');
    options.classList.remove('active');
    
    // Сохраняем выбор
    state.topSelections[actionId].subType = subtypeValue;
    
    // Показываем поле ввода позиции
    document.getElementById(`top-position-input-${actionId}`).style.display = 'block';
}

// Обработка ввода позиции топа
function handleTopPositionInput(actionId, position) {
    state.topSelections[actionId].position = position;
    
    // Формируем итоговое значение для action
    const action = state.actions.find(a => a.id === actionId);
    if (action) {
        const selection = state.topSelections[actionId];
        let displayValue = '';
        
        if (selection.topType === 'messages' && selection.subType) {
            displayValue = `Сообщения ${selection.subType === 'global' ? 'Глобал' : 'Локал'}`;
        } else {
            const topOption = topOptions.find(t => t.value === selection.topType);
            displayValue = topOption ? topOption.label : selection.topType;
        }
        
        action.value = JSON.stringify({
            topType: selection.topType,
            subType: selection.subType,
            position: selection.position,
            display: `${displayValue} - позиция ${selection.position}`
        });
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
        'get_top_position': '🏆',
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

        // Специальная проверка для get_top_position
        if (action.type === 'get_top_position') {
            const selection = state.topSelections[action.id];
            if (!selection || !selection.topType) {
                showNotification(`Выберите тип топа для действия ${i + 1}`, 'error');
                return false;
            }
            if (selection.topType === 'messages' && !selection.subType) {
                showNotification(`Выберите тип топа сообщений для действия ${i + 1}`, 'error');
                return false;
            }
            if (!selection.position) {
                showNotification(`Укажите позицию топа для действия ${i + 1}`, 'error');
                return false;
            }
            continue;
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
