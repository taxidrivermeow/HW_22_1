(() => {
    const store = new Store();
    const nodes = {
        sideNavUl: document.querySelector('#section .side-nav ul'),
        navDiv: document.querySelector('.nav'),
        productsLinkLi: document.getElementById('productsLink'),
        addLinkLi: document.getElementById('addLink'),
        addForm: document.querySelector('#section form'),
        contentDiv: document.querySelector('#section .content'),
        sideNavDiv: document.querySelector('#section .side-nav'),
        extraInput: document.getElementById('extra'),
        typeSelect: document.getElementById('type'),
        notifications: document.getElementById('notifications'),
        randomValues: document.getElementById('random-values'),
    };

    const renderOptions = () => {
        nodes.typeSelect.innerHTML = '';
        Object.keys(store.allExtras).forEach(key => {
            const option = document.createElement('option');
            option.setAttribute('value', key);
            option.innerText = key[0].toUpperCase() + key.slice(1);
            nodes.typeSelect.appendChild(option);
        });
        updateExtraField(nodes.typeSelect.value);
    }

    const choosedFilter = () => {
        let type;
        document.querySelectorAll('.side-nav li').forEach(li => {
            if (li.classList.contains('active')) {
                type = li.dataset.name;
            }
        });
        return type;
    }

    const sideNavRender = () => {
        const filterType = choosedFilter();
        const types = [];

        if (filterType === 'All' || !filterType) {
            nodes.sideNavUl.innerHTML = '<li data-name="All" class="active">All products</li>';
        } else {
            nodes.sideNavUl.innerHTML = '<li data-name="All">All products</li>';
        }
        store.getAll().forEach(value => {
            if (!types.includes(value.constructor.name)) {
                types.push(value.constructor.name);
                const li = document.createElement('li')
                li.setAttribute('data-name', value.constructor.name);
                if (value.constructor.name === filterType) {
                    li.classList.add('active');
                }
                li.textContent = value.constructor.name;
                nodes.sideNavUl.append(li);
            }
        });
    }

    const render = () => {
        let products;
        let type = choosedFilter();
        products = (type === 'All') ? store.getAll() : store.getByType(type);

        nodes.contentDiv.innerHTML = products.map(product => {
            return `
                <div class="card">
                    <h2>${product.constructor.name}</h2>
                    <h3>${product.title}</h3>
                    <h3>${product.manufacture}</h3>
                    <h4>${product.extraFields.field}: ${product.extra}${product.extraFields.measure}</h4>
                    <h4>Price: ${product.price} NIS</h4>
                </div>
            `;
        }).join('');
        sideNavRender();
    };

    const updateExtraField = e => {
        let target = '';
        if (typeof e === 'string') {
            target = e;
        } else {
            target = e.target.value
        }
        const type = store.allExtras[target].type;
        const placeholder = `Type ${store.allExtras[target].field.toLowerCase()}`
        nodes.extraInput.setAttribute('type', type);
        nodes.extraInput.setAttribute('placeholder', placeholder);

        if (type === 'number') {
            nodes.extraInput.setAttribute('step', '0.5');
            nodes.extraInput.setAttribute('min', '0');
        }
    }

    nodes.typeSelect.addEventListener('change', updateExtraField);

    nodes.navDiv.addEventListener('click', e => {
        const navID = e.target.getAttribute('id');
        if (navID === 'productsLink') {
            nodes.productsLinkLi.classList.add('active');
            nodes.addLinkLi.classList.remove('active');
            nodes.addForm.classList.add('hide');
            nodes.contentDiv.classList.remove('hide');
            nodes.sideNavDiv.classList.remove('hide');
        } else if (navID === 'addLink') {
            nodes.productsLinkLi.classList.remove('active');
            nodes.addLinkLi.classList.add('active');
            nodes.addForm.classList.remove('hide');
            nodes.contentDiv.classList.add('hide');
            nodes.sideNavDiv.classList.add('hide');
        }
    });

    nodes.sideNavDiv.addEventListener('click', e => {
        if (e.target.dataset.name) {
            document.querySelectorAll('.side-nav li').forEach(li => {
                li.classList.remove('active');
            });
            e.target.classList.add('active');
            render();
        }
    });

    const clearNotifications = () => {
        nodes.notifications.innerHTML = '';
    }

    const showNotification = () => {
        nodes.notifications.innerHTML = `<div class="alert-success">The product has been added successfully</div>`;
        setTimeout(clearNotifications, 3000);
    }

    const showErrors = errCodes => {
        const errors = {
            title: 'Invalid value for title',
            manufacture: 'Invalid value for manufacture',
            type: 'Invalid value for product type',
            price: 'Invalid value for price',
            extra: 'Invalid value for additional field',
        }
        let errorsHTML = errCodes.map(errCode => {
            return `<div class="alert-danger">${errors[errCode]}</div>`;
        }).join('');
        clearNotifications();
        nodes.notifications.innerHTML = errorsHTML;
    }

    const checkCorrectValues = (title, manufacture, price, type, extra) => {
        const isCorrectNumber = x => {
            const numX = +x;
            return (x !== '' && !isNaN(numX) && numX > 0);
        }

        let noErrs = true;
        let errCodes = [];

        if (title === '') {
            noErrs = false;
            errCodes.push('title');
        }

        if (manufacture === '') {
            noErrs = false;
            errCodes.push('manufacture');
        }

        if (!isCorrectNumber(price)) {
            noErrs = false;
            errCodes.push('price');
        }

        if ((store.allExtras[type].type === 'number' && !isCorrectNumber(extra)) || (store.allExtras[type].type === 'text' && extra === '')) {
            noErrs = false;
            errCodes.push('extra');
        }

        clearNotifications();
        (noErrs)?showNotification():showErrors(errCodes);
        return noErrs;
    }

    nodes.addForm.addEventListener('submit', e => {
        e.preventDefault();
        const title = e.target.title.value.trim();
        const manufacture = e.target.manufacture.value.trim();
        const price = e.target.price.value.trim();
        const type = e.target.type.value.trim();
        const extra = e.target.extra.value.trim();

        if (checkCorrectValues(title, manufacture, price, type, extra)) {
            switch (type) {
                case 'milk': {
                    store.add(new Milk(title, manufacture, price, extra));
                    break;
                }
                case 'chocolate': {
                    store.add(new Chocolate(title, manufacture, price, extra));
                    break;
                }
                case 'wine': {
                    store.add(new Wine(title, manufacture, price, extra));
                    break;
                }
                case 'butter': {
                    store.add(new Butter(title, manufacture, price, extra));
                    break;
                }
            }
            nodes.addForm.reset();
            render();
        }
    });

    nodes.randomValues.addEventListener('click', () => {
        const randomizer = (min, max, symbolsAfterComma = 0) => Math.floor(Math.random() * (max - min) + min);
        const types = [
            {
                type: 'milk',
                title: ['Borden Dairy', 'Fairlife', 'Alta Dena', 'Darigold', 'Shamrock Farms', 'Organic Valley', 'Stonyfield Organic', 'Wegmans'],
                manufacture: ['Nestle', 'Lactalis', 'Danone', 'Fonterra', 'Frieslandcampina', 'Dairy Farmers of America', 'Arla Foods', 'Yili Group', 'Saputo', 'Mengniu Dairy'],
                price: randomizer(3, 20),
                extra: ['0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9']
            },
            {
                type: 'butter',
                title: ['Borden Dairy', 'Fairlife', 'Alta Dena', 'Darigold', 'Shamrock Farms', 'Organic Valley', 'Stonyfield Organic', 'Wegmans'],
                manufacture: ['Nestle', 'Lactalis', 'Danone', 'Fonterra', 'Frieslandcampina', 'Dairy Farmers of America', 'Arla Foods', 'Yili Group', 'Saputo', 'Mengniu Dairy'],
                price: randomizer(3, 20),
                extra: ['100', '125', '150', '175', '200', '225', '250', '275', '300', '325', '350', '375', '400']
            },
            {
                type: 'chocolate',
                title: ['Lindt', 'Nestle', 'Hershey’s', 'Milka', 'Mars', 'Cadbury', 'Godiva', 'Dove', 'Ghirardelli', 'Guylian', 'Kinder', 'Toblerone', 'Ferrero Rocher', 'Ritter Sport'],
                manufacture: ['Mars Wrigley Confectionery', 'Ferrero Group', 'Mondelez International', 'Meiji Co. Ltd.', 'Hershey Company', 'Nestle', 'Chocoladefabriken Lindt Sprungli AG', 'Haribo GmbH Co. K.G.', 'Orion Corp.'],
                price: randomizer(3, 20),
                extra: ['Milk Chocolate', 'White Chocolate', 'Dark Chocolate', 'Semisweeet Chocolate', 'Bittersweet Chocolate', 'Unsweetened Chocolate', 'Sweet German Chocolate', 'Couverture Chocolate', 'Ruby Chocolate']
            },
            {
                type: 'wine',
                title: ['Beringer Founders Estate California Cabernet Sauvignon', 'Bogle Old Vine California Zinfandel', 'Chateau Ste. Michelle Columbia Valley Merlot', 'Columbia Crest H3 Cabernet Sauvignon', 'Foxglove Central Coast Chardonnay', 'Hess Select North Coast Cabernet Sauvignon', 'J. Lohr Estates Seven Oaks Cabernet Sauvignon', 'Kendall Jackson Vintner\'s Reserve California Chardonnay', 'Pine Ridge Chenin Blanc', 'Rancho Zabaco Heritage Vines Sonoma County Zinfandel', 'Robert Mondavi Winery Napa Valley Fume Blanc', 'La Crema Sonoma Coast Chardonnay'],
                manufacture: ['E & J Gallo', 'The Wine Group', 'Treasury Wine Estate', 'Vina Concha Y Toro', 'Castel Freres', 'Accolade Wines', 'Pernod Ricard', 'Grupo Penaflor', 'Fecovita Co-Op'],
                price: randomizer(29, 500),
                extra: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
            }
        ];

        const index = randomizer(0, types.length);
        if (types[index].type === 'chocolate') {
            nodes.extraInput.setAttribute('type', 'text');
            nodes.extraInput.setAttribute('placeholder', 'Type kind');
        } else if (types[index].type === 'milk') {
            nodes.extraInput.setAttribute('type', 'number');
            nodes.extraInput.setAttribute('placeholder', 'Type fat');
        } else if (types[index].type === 'wine') {
            nodes.extraInput.setAttribute('type', 'number');
            nodes.extraInput.setAttribute('placeholder', 'Type alcohol');
        }

        nodes.addForm.type.value = types[index].type;
        nodes.addForm.title.value = types[index].title[randomizer(0, types[index].title.length)];
        nodes.addForm.manufacture.value = types[index].manufacture[randomizer(0, types[index].manufacture.length)];
        nodes.addForm.price.value = types[index].price;
        nodes.addForm.extra.value = types[index].extra[randomizer(0, types[index].extra.length)];
    });

    render();
    renderOptions();
})()