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
    { value: 'robbery', label: 'Ограбление', placeholder: 'Введите ID пользователя', needsTopResult: true },
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
    
    // Создаем стандартный браузерный select
    const select = document.createElement('select');
    select.className = 'input-select';
    select.id = `select-${actionId}`;
    
    // Добавляем пустую опцию
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Выберите действие';
    select.appendChild(emptyOption);
    
    // Добавляем опции действий
    actionTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = `${getActionIcon(type.value)} ${type.label}`;
        select.appendChild(option);
    });
    
    // Обработчик изменения
    select.onchange = (e) => {
        handleActionTypeChange(actionId, e.target.value);
    };
    
    formGroup1.appendChild(select);
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
            <select class="input-select" id="top-select-${actionId}" onchange="handleTopTypeChange(${actionId}, this.value)">
                <option value="">Выберите топ</option>
                ${topOptions.map(opt => 
                    `<option value="${opt.value}">${getTopIcon(opt.value)} ${opt.label}</option>`
                ).join('')}
            </select>
            <div id="top-subtype-${actionId}" style="display: none; margin-top: 12px;">
                <label>Тип топа сообщений</label>
                <select class="input-select" id="top-subtype-select-${actionId}" onchange="handleTopSubtypeChange(${actionId}, this.value)">
                    <option value="">Выберите тип</option>
                </select>
            </div>
            <div id="top-position-input-${actionId}" style="display: none; margin-top: 12px;">
                <label>Укажите позицию топа, которую нужно найти (Пример: 4)</label>
                <button class="btn-insert-top-result" onclick="insertMyPosition(${actionId})" style="margin-bottom: 10px;">
                    👤 Моя позиция
                </button>
                <div id="position-input-container-${actionId}">
                    <input 
                        type="number" 
                        class="input-field" 
                        id="position-number-input-${actionId}"
                        placeholder="Например: 4" 
                        min="1"
                        oninput="handleTopPositionInput(${actionId}, this.value)"
                    />
                </div>
            </div>
        `;
        
        // Инициализируем данные для этого действия
        if (!state.topSelections[actionId]) {
            state.topSelections[actionId] = {
                topType: null,
                subType: null,
                position: null
            };
        }
    } else if (actionType === 'send_message') {
        // Специальная обработка для "Отправить сообщение"
        const actionTypeObj = actionTypes.find(t => t.value === actionType);
        valueGroup.style.display = 'block';
        
        // Проверяем есть ли предыдущее действие с get_top_position
        const currentActionIndex = state.actions.findIndex(a => a.id === actionId);
        const hasPreviousTopAction = currentActionIndex > 0 && 
            state.actions.slice(0, currentActionIndex).some(a => a.type === 'get_top_position');
        
        // Восстанавливаем структуру с кнопкой если есть предыдущее действие топа
        valueGroup.innerHTML = `
            <label id="action-label-${actionId}">${actionTypeObj.label}</label>
            ${hasPreviousTopAction ? `
                <button class="btn-insert-top-result" onclick="insertTopResult(${actionId})">
                    🏆 Вывести результат поиска топа
                </button>
            ` : ''}
            <div id="message-input-container-${actionId}">
                <textarea 
                    class="input-textarea" 
                    id="action-input-${actionId}"
                    placeholder="${actionTypeObj.placeholder}"
                    oninput="handleMessageInput(${actionId}, this.value)"
                ></textarea>
            </div>
        `;
    } else if (actionType === 'robbery') {
        // Специальная обработка для "Ограбление"
        const actionTypeObj = actionTypes.find(t => t.value === actionType);
        valueGroup.style.display = 'block';
        
        // Проверяем есть ли предыдущее действие с get_top_position и это баланс
        const currentActionIndex = state.actions.findIndex(a => a.id === actionId);
        let hasPreviousBalanceTop = false;
        
        if (currentActionIndex > 0) {
            // Ищем предыдущие get_top_position действия
            for (let i = 0; i < currentActionIndex; i++) {
                const prevAction = state.actions[i];
                if (prevAction.type === 'get_top_position') {
                    const selection = state.topSelections[prevAction.id];
                    if (selection && selection.topType === 'balance') {
                        hasPreviousBalanceTop = true;
                        break;
                    }
                }
            }
        }
        
        // Восстанавливаем структуру с кнопкой если есть предыдущее действие топа баланса
        valueGroup.innerHTML = `
            <label id="action-label-${actionId}">${actionTypeObj.label}</label>
            ${hasPreviousBalanceTop ? `
                <button class="btn-insert-top-result" onclick="insertTopResultID(${actionId})">
                    👤 Вставить из результата поиска
                </button>
            ` : ''}
            <div id="robbery-input-container-${actionId}">
                <input 
                    type="text" 
                    class="input-field" 
                    id="action-input-${actionId}"
                    placeholder="${actionTypeObj.placeholder}"
                    oninput="handleRobberyInput(${actionId}, this.value)"
                />
            </div>
        `;
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

// Обработка ввода сообщения с автозаменой {topresult}
function handleMessageInput(actionId, value) {
    const action = state.actions.find(a => a.id === actionId);
    if (!action) return;
    
    // Проверяем есть ли предыдущее действие с get_top_position
    const currentActionIndex = state.actions.findIndex(a => a.id === actionId);
    const hasPreviousTopAction = currentActionIndex > 0 && 
        state.actions.slice(0, currentActionIndex).some(a => a.type === 'get_top_position');
    
    // Если есть {topresult} в тексте и есть предыдущее действие топа
    if (hasPreviousTopAction && value.includes('{topresult}')) {
        // Заменяем на блок
        insertTopResult(actionId);
    } else {
        action.value = value;
    }
}

// Обработка ввода ID для ограбления с автозаменой {topresultID}
function handleRobberyInput(actionId, value) {
    const action = state.actions.find(a => a.id === actionId);
    if (!action) return;
    
    // Проверяем есть ли предыдущее действие с get_top_position и это баланс
    const currentActionIndex = state.actions.findIndex(a => a.id === actionId);
    let hasPreviousBalanceTop = false;
    
    if (currentActionIndex > 0) {
        for (let i = 0; i < currentActionIndex; i++) {
            const prevAction = state.actions[i];
            if (prevAction.type === 'get_top_position') {
                const selection = state.topSelections[prevAction.id];
                if (selection && selection.topType === 'balance') {
                    hasPreviousBalanceTop = true;
                    break;
                }
            }
        }
    }
    
    // Если есть {topresultID} в тексте и есть предыдущее действие топа баланса
    if (hasPreviousBalanceTop && value.includes('{topresultID}')) {
        // Заменяем на блок
        insertTopResultID(actionId);
    } else {
        action.value = value;
    }
}

// Вставка результата топа
function insertTopResult(actionId) {
    const action = state.actions.find(a => a.id === actionId);
    if (!action) return;
    
    // Устанавливаем специальное значение
    action.value = '{topresult}';
    
    // Заменяем textarea на блок с результатом
    const container = document.getElementById(`message-input-container-${actionId}`);
    container.innerHTML = `
        <div class="top-result-block">
            <div class="top-result-content">
                <span class="top-result-icon">🏆</span>
                <span class="top-result-text">{topresult}</span>
            </div>
            <button class="top-result-remove" onclick="removeTopResult(${actionId})">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
    `;
}

// Удаление результата топа и возврат к вводу
function removeTopResult(actionId) {
    const action = state.actions.find(a => a.id === actionId);
    if (!action) return;
    
    action.value = '';
    
    // Возвращаем textarea
    const container = document.getElementById(`message-input-container-${actionId}`);
    const actionTypeObj = actionTypes.find(t => t.value === 'send_message');
    
    container.innerHTML = `
        <textarea 
            class="input-textarea" 
            id="action-input-${actionId}"
            placeholder="${actionTypeObj.placeholder}"
            oninput="handleMessageInput(${actionId}, this.value)"
        ></textarea>
    `;
}

// Вставка ID результата топа
function insertTopResultID(actionId) {
    const action = state.actions.find(a => a.id === actionId);
    if (!action) return;
    
    // Устанавливаем специальное значение
    action.value = '{topresultID}';
    
    // Заменяем input на блок с результатом
    const container = document.getElementById(`robbery-input-container-${actionId}`);
    container.innerHTML = `
        <div class="top-result-block">
            <div class="top-result-content">
                <span class="top-result-icon">👤</span>
                <span class="top-result-text">{topresultID}</span>
            </div>
            <button class="top-result-remove" onclick="removeTopResultID(${actionId})">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
    `;
}

// Удаление ID результата топа и возврат к вводу
function removeTopResultID(actionId) {
    const action = state.actions.find(a => a.id === actionId);
    if (!action) return;
    
    action.value = '';
    
    // Возвращаем input
    const container = document.getElementById(`robbery-input-container-${actionId}`);
    const actionTypeObj = actionTypes.find(t => t.value === 'robbery');
    
    container.innerHTML = `
        <input 
            type="text" 
            class="input-field" 
            id="action-input-${actionId}"
            placeholder="${actionTypeObj.placeholder}"
            oninput="handleRobberyInput(${actionId}, this.value)"
        />
    `;
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

// Обработка изменения типа топа
function handleTopTypeChange(actionId, topValue) {
    if (!topValue) return;
    
    const topOption = topOptions.find(opt => opt.value === topValue);
    if (!topOption) return;
    
    // Сохраняем выбор
    state.topSelections[actionId].topType = topValue;
    
    // Показываем/скрываем подтип для сообщений
    const subtypeContainer = document.getElementById(`top-subtype-${actionId}`);
    const subtypeSelect = document.getElementById(`top-subtype-select-${actionId}`);
    
    if (topOption.hasSubType && topOption.subTypes) {
        subtypeContainer.style.display = 'block';
        
        // Заполняем опции подтипа
        subtypeSelect.innerHTML = '<option value="">Выберите тип</option>';
        topOption.subTypes.forEach(subType => {
            const option = document.createElement('option');
            option.value = subType.value;
            option.textContent = `${subType.value === 'local' ? '🏠' : '🌍'} ${subType.label}`;
            subtypeSelect.appendChild(option);
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

// Обработка изменения подтипа топа
function handleTopSubtypeChange(actionId, subtypeValue) {
    if (!subtypeValue) return;
    
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

// Вставка "Моя позиция"
function insertMyPosition(actionId) {
    const action = state.actions.find(a => a.id === actionId);
    if (!action) return;
    
    // Устанавливаем специальное значение
    state.topSelections[actionId].position = '{me}';
    
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
        position: '{me}',
        display: `${displayValue} - моя позиция`
    });
    
    // Заменяем input на блок с результатом
    const container = document.getElementById(`position-input-container-${actionId}`);
    container.innerHTML = `
        <div class="top-result-block">
            <div class="top-result-content">
                <span class="top-result-icon">👤</span>
                <span class="top-result-text">{me}</span>
            </div>
            <button class="top-result-remove" onclick="removeMyPosition(${actionId})">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
    `;
}

// Удаление "Моя позиция" и возврат к вводу
function removeMyPosition(actionId) {
    const action = state.actions.find(a => a.id === actionId);
    if (!action) return;
    
    state.topSelections[actionId].position = null;
    action.value = '';
    
    // Возвращаем input
    const container = document.getElementById(`position-input-container-${actionId}`);
    container.innerHTML = `
        <input 
            type="number" 
            class="input-field" 
            id="position-number-input-${actionId}"
            placeholder="Например: 4" 
            min="1"
            oninput="handleTopPositionInput(${actionId}, this.value)"
        />
    `;
}

// Получить иконку для типа действия
function getActionIcon(actionType) {
    const icons = {
        'send_message': '💬',
        'send_photo': '🖼️',
        'get_top_position': '🏆',
        'robbery': '💰'
    };
    return icons[actionType] || '⚙️';
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
    const actionToRemove = state.actions.find(a => a.id === actionId);
    
    // Анимация удаления
    actionElement.style.opacity = '0';
    actionElement.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
        actionElement.remove();
        state.actions = state.actions.filter(a => a.id !== actionId);
        
        // Если удаляемое действие было get_top_position, сбрасываем зависимые действия
        if (actionToRemove && actionToRemove.type === 'get_top_position') {
            resetDependentActions(actionId);
        }
        
        updateActionNumbers();
        updateAddActionButton();
    }, 400);
}

// Сброс зависимых действий при удалении get_top_position
function resetDependentActions(removedActionId) {
    // Находим индекс удаленного действия
    const allActionElements = document.querySelectorAll('.action-item');
    let removedIndex = -1;
    
    allActionElements.forEach((element, index) => {
        if (element.id === `action-${removedActionId}`) {
            removedIndex = index;
        }
    });
    
    // Проверяем есть ли другие get_top_position действия перед текущими
    const hasOtherTopAction = state.actions.some(a => a.type === 'get_top_position');
    
    // Сбрасываем все действия после удаленного, которые зависят от top result
    state.actions.forEach((action, index) => {
        if (index > removedIndex && !hasOtherTopAction) {
            // Если это send_message или robbery с topresult
            if ((action.type === 'send_message' && action.value === '{topresult}') ||
                (action.type === 'robbery' && action.value === '{topresultID}')) {
                // Сбрасываем значение
                action.value = '';
                
                // Перерисовываем действие
                const actionElement = document.getElementById(`action-${action.id}`);
                if (actionElement) {
                    // Триггерим повторную отрисовку действия
                    handleActionTypeChange(action.id, action.type);
                }
            }
        }
    });
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
            if (!selection.position || (selection.position !== '{me}' && !selection.position)) {
                showNotification(`Укажите позицию топа или выберите "Моя позиция" для действия ${i + 1}`, 'error');
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
