
function BaseModel(attributes) {
    for (let key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            this[key] = attributes[key];
        }
    }
}

BaseModel.prototype.getFact = function() {
    return 'All birds are considered dinosaurs.';
}


// Create Dino Constructor
function DinoModel(dino, human) {
    BaseModel.call(this, dino);

    this.human = human;
    this.factsMap = [
        'ProvidedFact',
        'WeightComparison',
        'HeightComparison',
        'DietComparison',
        'LocationFact',
        'TimePeriodFact'
    ];
}

DinoModel.prototype = Object.create(BaseModel.prototype);

DinoModel.prototype.constructor = DinoModel;

// Create Dino Compare Method 1
// NOTE: Weight in JSON file is in lbs, height in inches. 
DinoModel.prototype._getWeightComparison = function() {
    const humanName = this.human.name;
    const humanWeight = this.human.weight;
    const dinoWeight = this.weight;
    const difference = Math.abs(dinoWeight - humanWeight);

    let fact = `${this.species} typically weighed ${dinoWeight} pounds. `;

    if (dinoWeight > humanWeight) {
        fact = fact.concat(`That's ${difference} pounds more than ${humanName}!`);
    } else if (dinoWeight < humanWeight) {
        fact = fact.concat(`That's ${difference} pounds less than ${humanName}!`);
    } else {
        fact = fact.concat(`That's the same weight as ${humanName}!`);
    }

    return fact;
}

// Create Dino Compare Method 2
// NOTE: Weight in JSON file is in lbs, height in inches.
DinoModel.prototype._getHeightComparison = function() {
    const humanName = this.human.name;
    const humanFeet = this.human.feet;
    const humanInches = this.human.inches;
    const humanHeight = humanFeet * 12 + humanInches;
    const dinoHeight = this.height;
    const difference = Math.abs(dinoHeight - humanHeight);

    let fact = `${this.species} was typically ${dinoHeight} inches in height. `;

    if (dinoHeight > humanHeight) {
        fact = fact.concat(`That's ${difference} inches taller than ${humanName}!`);
    } else if (dinoHeight < humanHeight) {
        fact = fact.concat(`That's ${difference} inches shorter than ${humanName}!`);
    } else {
        fact = fact.concat(`That's the same height as ${humanNane}!`)
    }

    return fact;
}

// Create Dino Compare Method 3
// NOTE: Weight in JSON file is in lbs, height in inches.
DinoModel.prototype._getDietComparison = function() {
    const humanName = this.human.name;
    const humanDiet = this.human.diet;
    const dinoDiet = this.diet;

    let fact = `${this.species} had a ${dinoDiet} diet, `;

    if (dinoDiet === humanDiet) {
        fact = fact.concat(`just like ${humanName}!`);
    } else {
        fact = fact.concat(`while ${humanName} has a ${humanDiet} diet.`);
    }

    return fact;
}

DinoModel.prototype._getLocationFact = function() {
    return `${this.species} was located in ${this.where}.`;
}

DinoModel.prototype._getTimePeriodFact = function() {
    return `${this.species} lived during the ${this.when} period.`;
}

DinoModel.prototype._getProvidedFact = function() {
    return this.fact;
}

DinoModel.prototype.getFact = function() {
    const randomIndex = Math.floor(Math.random() * this.factsMap.length);
    const factMethod = this.factsMap[randomIndex];

    return this[`_get${factMethod}`]();
}


function HumanModel(attributes) {
    BaseModel.call(this, attributes);

    this.species = 'Human';
    this.diet = this.diet.toLowerCase();
    this.feet = Number(this.feet);
    this.inches = Number(this.inches);
}

HumanModel.prototype = Object.create(BaseModel.prototype);

HumanModel.prototype.constructor = HumanModel;

HumanModel.prototype.getFact = function() {
    return `A ${this.species.toLocaleLowerCase()} named ${this.name}.`;
}


function Card(entity) {
    this.name = entity.species;
    this.src = this._getImageSrc();
    this.fact = entity.getFact();
}

Card.prototype._getImageSrc = function() {
    const name = this.name.toLowerCase();

    return `images/${name}.png`;
}

Card.prototype.getHTML = function() {
    return `<div class="grid-item">
        <h3>${this.name}</h3>
        <img src="${this.src}"/>
        <p>${this.fact}</p>
    </div>`;
}


// Use IIFE to get human data from form
const app = (function() {
    const formEl = document.getElementById('dino-compare');
    const gridEl = document.getElementById('grid');

    function renderTiles(models) {
        // Generate Tiles for each Dino in Array
        const html = models.reduce((markup, model) => {
            const card = new Card(model);
            markup = markup.concat(card.getHTML());

            return markup;
        }, '');

        // Add tiles to DOM
        gridEl.innerHTML = html;
    }

    function processData(data) {
        const dinos = data.Dinos;
        const formValues = getFormValues();

        // Create Human Object
        const human = new HumanModel(formValues);

        // Create Dino Objects
        const models = dinos.reduce((instances, dino) => {
            // Pigeon should only display 1 fact
            const model = dino.species === 'Pigeon'
                ? new BaseModel(dino)
                : new DinoModel(dino, human);

            instances.push(model);

            return instances;
        }, []);

        // Make human the middle tile
        models.splice(4, 0, human);

        return models;
    }

    function getFormValues() {
        const fields = [
            'name',
            'feet',
            'inches',
            'weight',
            'diet'
        ];
    
        const values = fields.reduce((values, field) => {
            const value = document.getElementById(field).value;
            values[field] = value;

            return values;
        }, {});
    
        return values;
    }

    function handleFormSubmit(evt) {
        evt.preventDefault();

        fetch('dino.json')
            .then(response => response.json())
            .then(processData)
            .then(renderTiles)
            // Remove form from screen
            .then(() => evt.target.style.display = 'none')
            .catch((error) => alert(`Something went wrong: ${error}`));
    }

    function init() {
        // On button click, prepare and display infographic
        formEl.addEventListener('submit', handleFormSubmit);
    }

    return { init };
})();

window.addEventListener('DOMContentLoaded', app.init);
