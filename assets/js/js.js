let traits = [];
let currentTraitIndex = null;

/*============================================================== STORAGE ==============================================================*/

function saveData() {

    localStorage.setItem(
        'traits_data',
        JSON.stringify(traits)
    );

}

function loadData() {

    const data = localStorage.getItem('traits_data');

    if(data) {

        traits = JSON.parse(data);

        renderAllTraits();

    }

}

/*============================================================== NAV ==============================================================*/

function setting_toggle() {

    const nav = document.querySelector('.nav');
    const navbar_setting = document.querySelector('.navbar_setting');

    if (nav.classList.contains('closed')) {

        nav.classList.remove('closed');
        nav.classList.add('opened');

        navbar_setting.style.transform = 'translateX(320px)';

    } 
    else {

        nav.classList.add('closed');
        nav.classList.remove('opened');

        navbar_setting.style.transform = 'translateX(0px)';

    }

}

function checkTraits() {

    const list = document.querySelector('.trait_list');
    const warning = document.querySelector('.no_trait_warn');

    warning.style.display =
        list.children.length === 0
        ? 'block'
        : 'none';

}

/*============================================================== ADD TRAIT ==============================================================*/

function add_trait_func() {

    const name = `Trait ${traits.length + 1}`;

    const now = new Date();

    traits.push({

        name,

        tasks: [
            {
                name: "New Task",
                checked: {}
            }
        ],

        lastMonth: now.getMonth(),
        lastYear: now.getFullYear()

    });

    renderAllTraits();

    showTrait(traits.length - 1);

    saveData();

}

/*============================================================== STATE CELL HELPER ==============================================================*/

/*
    States:
    0 = unchecked (empty)
    1 = done      (green ✓)
    2 = failed    (red ✗)
    3 = skipped   (grey −)
*/
function applyStateCell(cell, state) {

    const configs = [
        { icon: '',    cls: '' },
        { icon: '✓',   cls: 'state_done' },
        { icon: '✗',   cls: 'state_fail' },
        { icon: '−',   cls: 'state_skip' }
    ];

    cell.classList.remove('state_done', 'state_fail', 'state_skip');

    const cfg = configs[state];
    cell.textContent = cfg.icon;
    if(cfg.cls) cell.classList.add(cfg.cls);

}

/*============================================================== CREATE CALENDAR ==============================================================*/

function createCalendar(traitIndex, month = null, year = null) {

    const trait = traits[traitIndex];

    const date = new Date();

    if(month === null) month = date.getMonth();
    if(year === null) year = date.getFullYear();

    const wrapper = document.createElement('div');

    wrapper.className = 'calendar_wrapper';

    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    const dayNames = ["M","T","W","T","F","S","S"];

    /*================ HEADER ================*/

    const heading = document.createElement('h2');

    heading.innerText =
        `${trait.name} - ${monthNames[month]} ${year}`;

    wrapper.appendChild(heading);

    /*================ GRID ================*/

    const grid = document.createElement('div');

    grid.className = 'calendar_grid';

    grid.style.gridTemplateColumns =
        `120px repeat(${daysInMonth}, 1fr)`;

    /*================ DATES ================*/

    grid.innerHTML += `<div></div>`;

    for(let d = 1; d <= daysInMonth; d++) {

        grid.innerHTML += `
            <div class="date_cell">${d}</div>
        `;

    }

    /*================ DAYS ================*/

    grid.innerHTML += `<div></div>`;

    for(let d = 1; d <= daysInMonth; d++) {

        const dayIndex =
            new Date(year, month, d).getDay();

        const adjusted =
            dayIndex === 0
            ? 6
            : dayIndex - 1;

        grid.innerHTML += `
            <div class="day_cell">
                ${dayNames[adjusted]}
            </div>
        `;

    }

    /*================ TASKS ================*/

    trait.tasks.forEach((task, taskIndex) => {

        grid.innerHTML += `
            <div class="trait_name">
                ${task.name}
            </div>
        `;

        for(let d = 1; d <= daysInMonth; d++) {

            const key = `${year}-${month}-${d}`;

            const state = task.checked[key] || 0;

            const cell = document.createElement('div');
            cell.className = 'state_cell';
            cell.dataset.task = taskIndex;
            cell.dataset.date = key;
            cell.dataset.state = state;
            applyStateCell(cell, state);
            grid.appendChild(cell);

        }

    });

    wrapper.appendChild(grid);

    /*================ SAVE STATE CELLS ================*/

    grid.querySelectorAll('.state_cell').forEach(cell => {

        cell.addEventListener('click', function() {

            const taskIndex = this.dataset.task;
            const date = this.dataset.date;
            const next = ((+this.dataset.state) + 1) % 4;

            this.dataset.state = next;
            applyStateCell(this, next);

            traits[currentTraitIndex]
                .tasks[taskIndex]
                .checked[date] = next;

            saveData();

        });

    });

    return wrapper;

}

/*============================================================== SHOW TRAIT ==============================================================*/

function showTrait(index) {

    currentTraitIndex = index;

    const calendarList =
        document.querySelector('.calendar_list');

    calendarList.innerHTML = '';

    const trait = traits[index];

    const now = new Date();

    const container =
        document.createElement('div');

    container.className = 'calendar_container';

    while (

        trait.lastYear < now.getFullYear()

        ||

        (
            trait.lastYear === now.getFullYear()
            &&
            trait.lastMonth < now.getMonth()
        )

    ) {

        trait.lastMonth++;

        if(trait.lastMonth > 11) {

            trait.lastMonth = 0;
            trait.lastYear++;

        }

    }

    container.appendChild(
        createCalendar(
            index,
            trait.lastMonth,
            trait.lastYear
        )
    );

    calendarList.appendChild(container);

    document.querySelectorAll('.trait_title')
    .forEach((el, i) => {

        el.classList.toggle(
            'active',
            i === index
        );

    });

}

/*============================================================== RENDER ALL TRAITS ==============================================================*/

function renderAllTraits() {

    const list =
        document.querySelector('.trait_list');

    list.innerHTML = '';

    traits.forEach((trait, index) => {

        const div = document.createElement('div');

        div.className = 'trait_title';

        div.innerHTML = `
            <i class="fa-solid fa-angle-right"></i>
            <div>${trait.name}</div>
        `;

        div.onclick = () => showTrait(index);

        list.appendChild(div);

    });

    checkTraits();

}

/*============================================================== DELETE TRAIT ==============================================================*/

function deleteTrait() {

    if(currentTraitIndex === null) return;

    traits.splice(currentTraitIndex, 1);

    currentTraitIndex = null;

    renderAllTraits();

    document.querySelector('.calendar_list')
        .innerHTML = '';

    saveData();

}

/*============================================================== TASK LIST ==============================================================*/

function renderTaskList() {

    const taskList =
        document.querySelector('.task_list');

    taskList.innerHTML = '';

    if(currentTraitIndex === null) return;

    const trait = traits[currentTraitIndex];

    trait.tasks.forEach((task, index) => {

        const div = document.createElement('div');

        div.className = 'task_element';

        div.innerHTML = `
            <span>${task.name}</span>

            <div class="task_icons">
                <i class="fa-solid fa-pencil rename_task"></i>
                <i class="fa-solid fa-trash delete_task"></i>
            </div>
        `;

        /*================ RENAME TASK ================*/

        div.querySelector('.rename_task')
        .onclick = () => {

            const newTask =
                prompt("Enter new task name:");

            if(!newTask) return;

            trait.tasks[index].name = newTask;

            renderTaskList();

            showTrait(currentTraitIndex);

            saveData();

        };

        /*================ DELETE TASK ================*/

        div.querySelector('.delete_task')
        .onclick = () => {

            trait.tasks.splice(index, 1);

            renderTaskList();

            showTrait(currentTraitIndex);

            saveData();

        };

        taskList.appendChild(div);

    });

}

/*============================================================== EDIT TRAIT ==============================================================*/

function editTrait() {

    if(currentTraitIndex === null) return;

    const dialog =
        document.querySelector(
            '.edit_trait_dialogbox'
        );

    dialog.style.display = 'flex';

    const trait = traits[currentTraitIndex];

    const renameInput =
        document.querySelector(
            '.rename_trait input'
        );

    renameInput.value = trait.name;

    document.querySelector('.rename')
    .onclick = () => {

        const newName =
            renameInput.value.trim();

        if(!newName) return;

        trait.name = newName;

        renderAllTraits();

        showTrait(currentTraitIndex);

        saveData();

    };

    renderTaskList();

}

/*============================================================== ADD TASK ==============================================================*/

document.querySelector('.add_task')
.onclick = () => {

    if(currentTraitIndex === null) return;

    const input =
        document.querySelector(
            '.task_add input'
        );

    const value = input.value.trim();

    if(!value) return;

    traits[currentTraitIndex]
    .tasks.push({

        name: value,
        checked: {}

    });

    input.value = '';

    renderTaskList();

    showTrait(currentTraitIndex);

    saveData();

};

/*============================================================== CLOSE DIALOG ==============================================================*/

document.addEventListener('click', (e) => {

    const dialog =
        document.querySelector(
            '.edit_trait_dialogbox'
        );

    const editButton =
        document.querySelector('.edit_trait');

    if(dialog.style.display === 'flex') {

        if(
            !dialog.contains(e.target)
            &&
            !editButton.contains(e.target)
        ) {

            dialog.style.display = 'none';

        }

    }

});

/*============================================================== DOWNLOAD JSON ==============================================================*/

async function downloadJSON() {

    const data = JSON.stringify(traits, null, 4);

    try {

        /*================ USE FILE SYSTEM ACCESS API ================*/

        const handle = await window.showSaveFilePicker({

            suggestedName: 'trait_master_data.json',

            types: [
                {
                    description: 'JSON File',
                    accept: {
                        'application/json': ['.json']
                    }
                }
            ]

        });

        const writable = await handle.createWritable();

        await writable.write(data);

        await writable.close();

        console.log("✓ Saved JSON to chosen location");

    }
    catch(err) {

        if(err.name === 'AbortError') {

            console.log("Save cancelled");

        }
        else {

            console.log("Save failed:", err);

        }

    }

}

/*============================================================== LOAD JSON ==============================================================*/

async function loadJSON() {

    try {

        const [handle] = await window.showOpenFilePicker({

            types: [
                {
                    description: 'JSON Files',
                    accept: {
                        'application/json': ['.json'],
                        'text/plain': ['.json']
                    }
                }
            ],
            excludeAcceptAllOption: false,
            multiple: false

        });

        const file = await handle.getFile();

        const text = await file.text();

        const data = JSON.parse(text);

        /*================ WARNING ================*/

        const confirmed = confirm(
            'Loading this file will replace your current data. Continue?'
        );

        if(!confirmed) return;

        /*================ LOAD DATA ================*/

        traits = data;

        renderAllTraits();

        if(traits.length > 0) {

            showTrait(0);

        }

        saveData();

        console.log("✓ Loaded JSON");

    }
    catch(err) {

        console.log("Load cancelled or failed:", err);

    }

}

/*============================================================== BUTTON HANDLERS ==============================================================*/

document.querySelector('.download_data')
.onclick = async () => {

    await downloadJSON();

};

document.querySelector('.load_data')
.onclick = async () => {

    await loadJSON();

};

/*============================================================== INIT ==============================================================*/

/*============================================================== INIT ==============================================================*/

loadData();

checkTraits();