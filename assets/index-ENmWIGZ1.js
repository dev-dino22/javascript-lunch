(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const SELECT_OPTIONS = {
  distance: [
    { value: "", label: "선택해 주세요" },
    { value: "5", label: "5분 내" },
    { value: "10", label: "10분 내" },
    { value: "15", label: "15분 내" },
    { value: "20", label: "20분 내" },
    { value: "30", label: "30분 내" }
  ],
  category: [
    { value: "", label: "선택해 주세요" },
    { value: "korean", label: "한식" },
    { value: "chinese", label: "중식" },
    { value: "japanese", label: "일식" },
    { value: "western", label: "양식" },
    { value: "asian", label: "아시안" },
    { value: "etc", label: "기타" }
  ],
  sortOption: [
    { value: "name", label: "이름순" },
    { value: "distance", label: "거리순" }
  ]
};
SELECT_OPTIONS.sortCategory = SELECT_OPTIONS.category.map(
  (option, index) => index === 0 ? { ...option, label: "전체" } : option
);
function SelectBox({ id, name, label, optionName, required, onChange }) {
  const options = SELECT_OPTIONS[optionName] || [];
  function template() {
    return `
      <div class="form-item ${required ? "form-item--required" : ""}">
        ${label ? `<label for="${id}" class="text-caption">${label}</label>` : ""}
        <select name="${name}" id="${id}" ${required ? "required" : ""} ${onChange ? `data-action="${onChange}"` : ""}>
          ${options.map(
      (option) => `
                <option value="${option.value}">${option.label}</option>
              `
    ).join("")}
        </select>
      </div>
    `;
  }
  return template();
}
function FilterBox() {
  return `
        ${SelectBox({
    id: "cartegoryFilter",
    name: "cartegoryFilter",
    optionName: "sortCategory",
    onChange: "categoryFilter-change"
  })}
        ${SelectBox({
    id: "sortFilter",
    name: "sortFilter",
    optionName: "sortOption",
    onChange: "sortFilter-change"
  })}
    `;
}
let filterState = {
  category: "",
  sortOption: "name"
};
function updateFilterState(newState) {
  filterState = {
    ...filterState,
    ...newState
  };
}
function sortFilter(items) {
  if (!Array.isArray(items)) return items;
  let filtered = items.map((item) => ({
    ...item
  }));
  console.log("filtered!!!!", filtered);
  if (filterState.category) {
    filtered = filtered.filter(
      (item) => item.category === filterState.category
    );
  }
  if (filterState.sortOption === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (filterState.sortOption === "distance") {
    filtered.sort((a, b) => Number(a.distance) - Number(b.distance));
  }
  return filtered;
}
function storageController(storage) {
  function getStorage2(key) {
    const item = storage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return [];
  }
  function setStorage2(key, value) {
    storage.setItem(key, JSON.stringify(value));
  }
  function removeStorage2(key) {
    storage.removeItem(key);
  }
  function clearStorage() {
    storage.clear();
  }
  return {
    getStorage: getStorage2,
    setStorage: setStorage2,
    removeStorage: removeStorage2,
    clearStorage
  };
}
const { getStorage, setStorage } = storageController(localStorage);
const getHTML$1 = (id) => document.getElementById(id);
const createElement = (tag) => document.createElement(tag);
function StarButton(isSelected) {
  return `
        <div>
            <button type="button">
                <svg width="28" height="26" viewBox="0 0 28 26" fill=${isSelected === true ? "#EC4A0A" : "none"} xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 21.0267L22.24 26L20.0534 16.6267L27.3334 10.32L17.7467 9.50666L14 0.666656L10.2534 9.50666L0.666687 10.32L7.94669 16.6267L5.76002 26L14 21.0267Z" fill="none"/>
                    <path d="M14.5168 20.1705L14 19.8586L13.4833 20.1705L7.27228 23.9192L8.92054 16.8538L9.05766 16.266L8.60146 15.8708L3.11285 11.116L10.3379 10.5031L10.9388 10.4521L11.1741 9.89688L14 3.22925L16.826 9.89688L17.0613 10.4521L17.6621 10.5031L24.8872 11.116L19.3986 15.8708L18.9424 16.266L19.0795 16.8538L20.7278 23.9192L14.5168 20.1705Z" stroke="#EC4A0A" stroke-opacity="0.5" stroke-width="2"/>
                </svg>
            </button>
        </div>
    `;
}
function CategoryIcon(category) {
  function template() {
    return `
        <div class="restaurant__category">
            <img src="./images/category-${category}.png" alt="${category}" class="category-icon">
        </div>
        `;
  }
  return template();
}
function StoreInfo({
  category,
  name,
  distance,
  description,
  link,
  isFavorite,
  type
}) {
  function template() {
    return `
        ${CategoryIcon(category)}
            ${type === "summary" ? `<div class="restaurant__info">` : `<div class="restaurant__info full">`}
            <div class="restaurant__title-box">
              <div class="restaurant__title">
                <h3 class="restaurant__name text-subtitle">${name}</h3>
                <span class="restaurant__distance text-body">캠퍼스부터 ${distance}분 내</span>
              </div>
              <div data-action="toggleFavorite" class="star-button-container">
          ${StarButton(isFavorite)}
        </div>
            </div>
               
                <p class="restaurant__description text-body">${description || "-"}</p>
                ${link && type === "full" ? `<a href="${link}" target="_blank" class="restaurant__link">${link}</a>` : ""}
            </div>
    `;
  }
  return template();
}
function LunchItem({
  id,
  category,
  name,
  distance,
  description,
  link,
  isFavorite
}) {
  const li = createElement("li");
  li.classList.add("restaurant");
  li.setAttribute("data-action", "showStoreDeleteModal");
  li.setAttribute("data-id", id);
  function render() {
    li.innerHTML = `
    ${StoreInfo({
      category,
      name,
      distance,
      description,
      link,
      type: "summary",
      isFavorite
    })}
  `;
    return li;
  }
  return render();
}
function LunchList(lunchListID = "restaurantListBox", favoriteTargetID = "restaurantFavoriteSection") {
  let lunchItems = getStorage("lunchItems") ?? [];
  function updateFilter(newState) {
    updateFilterState(newState);
    render();
  }
  function reloadLunchItems() {
    lunchItems = getStorage("lunchItems") ?? [];
  }
  function template(items) {
    const ul = createElement("ul");
    ul.classList.add("restaurant-list");
    if (items.length > 0) {
      items.forEach((item) => {
        ul.appendChild(LunchItem(item));
      });
    } else {
      ul.innerHTML = `
      <div class="empty-info-container">
      <div class="set-default-state-btn" data-action="setDefaultState">
        <svg id="Layer_1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><rect fill="#f0873c" height="470" rx="73.436" width="469.999" x="21" y="21"/><g fill-rule="evenodd"><path d="m94.437 21h323.126c40.39 0 73.436 33.046 73.436 73.436v323.128c0 16.799-5.721 32.325-15.305 44.734-12.409 9.584-27.935 15.305-44.734 15.305h-334.562c-34.148 0-62-27.852-62-62v-334.564c0-16.799 5.721-32.325 15.305-44.734 12.409-9.584 27.935-15.305 44.734-15.305z" fill="#ff954a"/><path d="m320.607 375.816h-163.281c-6.917 0-12.517 5.6-12.517 12.517s5.6 12.517 12.517 12.517h163.282c6.917 0 12.517-5.6 12.517-12.517s-5.6-12.517-12.517-12.517zm-153.776-107.145c-4.282-5.411-3.388-13.269 2.023-17.551s13.269-3.388 17.552 2.023l40.044 50.49v-160.176c0-6.917 5.6-12.47 12.517-12.47s12.517 5.552 12.517 12.47v160.176l40.044-50.49c4.282-5.411 12.14-6.305 17.552-2.023s6.353 12.14 2.023 17.551l-62.348 78.582c-2.353 3.011-5.976 4.753-9.788 4.753s-7.435-1.741-9.787-4.753l-62.348-78.582z" fill="#ed7c2b"/><path d="m337.623 365.921h-163.281c-6.917 0-12.517 5.6-12.517 12.517s5.6 12.517 12.517 12.517h163.281c6.917 0 12.517-5.6 12.517-12.517s-5.6-12.517-12.517-12.517zm-153.776-107.145c-4.282-5.411-3.388-13.27 2.023-17.551 5.411-4.282 13.269-3.388 17.551 2.023l40.044 50.49v-160.175c0-6.917 5.6-12.47 12.517-12.47s12.517 5.552 12.517 12.47v160.176l40.044-50.49c4.282-5.411 12.14-6.305 17.552-2.023 5.411 4.282 6.352 12.14 2.023 17.551l-62.348 78.582c-2.353 3.012-5.976 4.753-9.788 4.753s-7.435-1.741-9.787-4.753l-62.348-78.582z" fill="#fff"/></g></svg>
      </div>
      <div class="empty-info-box">
        <div class="empty-icon">
        <?xml version="1.0" encoding="UTF-8"?>
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 511.941 511.941" style="enable-background:new 0 0 511.941 511.941;" xml:space="preserve">
          <g>
            <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M123.181,170.091c28.17-43.47,77.12-72.24,132.79-72.24c87.34,0,158.12,70.797,158.12,158.12v126"/>
            <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M97.851,381.971v-126c0-19.18,3.41-37.56,9.67-54.57"/>
            
              <circle style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" cx="255.971" cy="323.493" r="15.059"/>
            <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M255.971,278.317L255.971,278.317c-8.573,0-15.775-6.446-16.722-14.967l-10.07-90.629c-1.774-15.968,10.725-29.933,26.792-29.933h0&#10;&#9;&#9;c16.066,0,28.566,13.965,26.792,29.933l-10.07,90.629C271.746,271.871,264.544,278.317,255.971,278.317z"/>
            <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M255.971,67.736L255.971,67.736c-8.317,0-15.059-6.742-15.059-15.059V22.559c0-8.317,6.742-15.059,15.059-15.059h0&#10;&#9;&#9;c8.317,0,15.059,6.742,15.059,15.059v30.118C271.029,60.994,264.287,67.736,255.971,67.736z"/>
            <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M122.868,122.868L122.868,122.868c-5.881,5.881-15.416,5.881-21.296,0L58.979,80.276c-5.881-5.881-5.881-15.416,0-21.296l0,0&#10;&#9;&#9;c5.881-5.881,15.416-5.881,21.296,0l42.593,42.593C128.749,107.453,128.749,116.988,122.868,122.868z"/>
            <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M389.073,122.868L389.073,122.868c5.881,5.881,15.416,5.881,21.296,0l42.593-42.593c5.881-5.881,5.881-15.416,0-21.296v0&#10;&#9;&#9;c-5.881-5.881-15.416-5.881-21.296,0l-42.593,42.593C383.192,107.453,383.192,116.988,389.073,122.868z"/>
            <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M67.735,255.971L67.735,255.971c0,8.317-6.742,15.059-15.059,15.059H22.559c-8.317,0-15.059-6.742-15.059-15.059v0&#10;&#9;&#9;c0-8.317,6.742-15.059,15.059-15.059h30.118C60.993,240.912,67.735,247.654,67.735,255.971z"/>
            <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M96.481,504.441h-13.86c-24.86,0-45-20.15-45-45v-30.47c0-24.85,20.14-45,45-45h223.86"/>
            <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M341.481,383.971h87.84c24.86,0,45,20.15,45,45v30.47c0,24.85-20.14,45-45,45h-297.84"/>
            <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;M489.382,271.03h-30.118c-8.317,0-15.059-6.742-15.059-15.059v0c0-8.317,6.742-15.059,15.059-15.059h30.118&#10;&#9;&#9;c8.317,0,15.059,6.742,15.059,15.059v0C504.441,264.288,497.699,271.03,489.382,271.03z"/>
            <g>
              
                <line style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="190.471" y1="422.859" x2="190.471" y2="434.859"/>
              <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="&#10;&#9;&#9;&#9;M310.072,434.524c0-7.68,6.226-13.906,13.906-13.906c7.68,0,13.906,6.226,13.906,13.906"/>
              <g>
                <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-miterlimit:10;" d="M256.066,442.742&#10;&#9;&#9;&#9;&#9;c0,7.984-6.472,14.456-14.456,14.456c-7.984,0-14.456-6.472-14.456-14.456"/>
                <path style="fill:none;stroke:#000000;stroke-width:15;stroke-linecap:round;stroke-miterlimit:10;" d="M284.977,442.742&#10;&#9;&#9;&#9;&#9;c0,7.984-6.472,14.456-14.456,14.456s-14.456-6.472-14.456-14.456"/>
              </g>
            </g>
          </g>
          </svg>
          </div>
        <p class="empty-message">음식점을 등록해주세요</p>
      </div>
      </div>
      `;
    }
    return ul;
  }
  function render() {
    reloadLunchItems();
    const filteredItems = sortFilter(lunchItems ?? []);
    const ul = template(filteredItems);
    getHTML$1(lunchListID).innerHTML = "";
    getHTML$1(lunchListID).innerHTML = ul.outerHTML;
  }
  function renderFavorites() {
    reloadLunchItems();
    const favorites = lunchItems.map((item) => ({ ...item })).filter((item) => item.isFavorite);
    const ul = template(favorites);
    getHTML$1(favoriteTargetID).innerHTML = "";
    getHTML$1(favoriteTargetID).appendChild(ul);
  }
  function addRestaurantItem({
    id,
    category,
    name,
    distance,
    description,
    link
  }) {
    const newItem = {
      id,
      category,
      name,
      distance,
      description,
      link,
      isFavorite: false
    };
    lunchItems.push(newItem);
    setStorage("lunchItems", lunchItems);
    render();
  }
  return {
    render,
    addRestaurantItem,
    renderFavorites,
    updateFilter
  };
}
function TabMenu() {
  return `
<div class="tab-container">
  <div class="tab-menu">
    <!-- <div class="tab-menu-box"> -->
        <button type="button" value="0" class="tab-item active" data-action="selectTab">모든 음식점</button>
        <button type="button" value="1" class="tab-item" data-action="selectTab">자주 가는 음식점</button>
    </div>
    <div class="tab-indicator">
        <div class="tab-indicator-thumb"></div>
    <!-- </div> -->
  </div>
</div>

    `;
}
function RestaurantTabMenu(targetID) {
  function render() {
    getHTML$1(targetID).innerHTML = "";
    getHTML$1(targetID).innerHTML = `
            ${TabMenu()}
        `;
  }
  return render();
}
function ChangeEvent(lunchList2) {
  document.removeEventListener("change", onChange);
  document.addEventListener("change", onChange.bind(this));
  function onChange(event) {
    const target = event.target;
    if (!target) return;
    const action = target.dataset.action;
    if (!action) return;
    switch (action) {
      case "categoryFilter-change":
        lunchList2.updateFilter({ category: target.value });
        break;
      case "sortFilter-change":
        lunchList2.updateFilter({
          sortOption: target.value
        });
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  }
}
const getHTML = (id) => document.getElementById(id);
function SubmitEvent(lunchList2) {
  document.addEventListener("submit", onSubmit.bind(this));
  function handleRestaurantSubmit(event, form) {
    event.preventDefault();
    const formData = new FormData(form);
    const category = formData.get("category");
    const name = formData.get("name");
    const distance = formData.get("distance");
    const description = formData.get("description");
    const link = formData.get("link");
    const id = crypto.randomUUID();
    lunchList2.addRestaurantItem({
      id,
      category,
      name,
      distance,
      description,
      link
    });
    closeModal();
  }
  function deleteStore(event, form) {
    const dataID = form.dataset.id;
    console.log("dataID", dataID);
    if (!dataID) return;
    const storageLunchItems = getStorage("lunchItems");
    const newStorageLunchItems = storageLunchItems.filter(
      (item) => item.id !== dataID
    );
    console.log("newStorageLunchItems", newStorageLunchItems);
    setStorage("lunchItems", newStorageLunchItems);
    LunchList().render();
    LunchList().renderFavorites();
    closeModal();
  }
  function closeModal() {
    const modalBackground = getHTML("modalBackground");
    if (modalBackground) {
      modalBackground.classList.remove("show");
    }
  }
  function onSubmit(event) {
    event.preventDefault();
    const form = event.target;
    console.log("form??", form);
    if (!form) return;
    if (form.id === "restaurantForm") {
      handleRestaurantSubmit(event, form);
    }
    if (form.id === "storeDeleteForm") {
      deleteStore(event, form);
    }
    form.reset();
  }
}
RestaurantTabMenu("restaurantTabMenuBox");
const filterBox = FilterBox();
document.getElementById("restaurantFilterBox").innerHTML = filterBox;
const lunchList = LunchList("restaurantListBox", "restaurantFavoriteSection");
lunchList.render();
lunchList.renderFavorites();
ChangeEvent(lunchList);
SubmitEvent(lunchList);
function Button({ id, type, content, dataSet, styleType, buttonValue }) {
  const classList = styleType === "primary" ? "button button--primary text-caption" : "button button--secondary text-caption";
  function template() {
    return `
        <button 
          ${buttonValue ? `value="${buttonValue}"` : ""} 
          ${id ? `id="${id}"` : ""}
          ${id ? `name="${id}"` : ""}
          type="${type}" 
          class="${classList}"
          ${dataSet ? `data-action="${dataSet}"` : ""}
        >
          ${content}
        </button>
    `;
  }
  return template();
}
function FormButtons(formName) {
  const storeAddBtns = `${Button({
    id: "closeModalBtn",
    type: "button",
    content: "취소하기",
    dataSet: "removeModal"
  })}

  ${Button({
    type: "submit",
    content: "추가하기",
    styleType: "primary"
  })}`;
  const storeDeleteBtns = `${Button({
    id: "storeDeleteBtn",
    type: "submit",
    content: "삭제하기",
    dataSet: "deleteStore"
  })}

  ${Button({
    type: "button",
    id: "closeModalBtn",
    content: "닫기",
    styleType: "primary",
    dataSet: "removeModal"
  })}`;
  function template() {
    return `
    <div id="buttonContainer" class="button-container" >
        ${formName === "storeAdd" && storeAddBtns || ""}
        ${formName === "storeDelete" && storeDeleteBtns || ""}
    </div>
      `;
  }
  return template();
}
function InputBox({
  id,
  name,
  label,
  required,
  placeHolder,
  maxLength,
  type,
  helpCaption
}) {
  function template() {
    return `
      <div class="form-item ${required ? "form-item--required" : ""}">
          <label for="${name} text-caption">${label}</label>
          <input type="${type}" name="${name}" id="${id}"  ${required ? "required" : ""} maxlength= "${maxLength}" placeholder= "${placeHolder}">
          ${helpCaption && `<span class="help-text text-caption">${helpCaption}</span>` || ""}
    </div>
    `;
  }
  return template();
}
function TextareaBox({
  id,
  name,
  label,
  required,
  cols,
  rows,
  helpCaption
}) {
  function template() {
    return `
        <div class="form-item ${""}">
          <label for="${name} text-caption">${label}</label>
          <textarea name="${name}" id="${id}"  ${""} cols="${cols}" rows= "${rows}"></textarea>
          ${`<span class="help-text text-caption">${helpCaption}</span>` || ""}
        </div>
    `;
  }
  return template();
}
function StoreAddForm({ id, label }) {
  function template() {
    return `
        ${`<h2 class="modal-title text-title">새로운 음식점</h2>`}
        <form id="${id}" class="modal-form">
          ${storeAddTemplate}
          ${FormButtons("storeAdd")}
        </form>
    `;
  }
  return template();
}
const storeAddTemplate = `
        ${SelectBox({
  id: "category",
  name: "category",
  label: "카테고리",
  optionName: "category",
  required: true
})}

        ${InputBox({
  name: "name",
  id: "name",
  required: true,
  label: "이름",
  placeHolder: "파양콩 할마니",
  maxLength: 15,
  type: "text"
})}

        ${SelectBox({
  id: "distance",
  name: "distance",
  label: "거리(도보 이동 시간)",
  optionName: "distance",
  required: true
})}

        ${TextareaBox({
  id: "description",
  name: "description",
  label: "설명",
  required: false,
  cols: "30",
  rows: "5",
  helpCaption: "메뉴 등 추가 정보를 입력해 주세요."
})}

        ${InputBox({
  name: "link",
  id: "link",
  required: false,
  label: "참고 링크",
  placeHolder: "https://",
  maxLength: 30,
  type: "url",
  helpCaption: "매장 정보를 확인할 수 있는 링크를 입력해 주세요."
})}
`;
function StoreDeleteForm(dataID) {
  const lunchItem = getStorage("lunchItems").find(({ id }) => id === dataID);
  function template() {
    return `
        <form id="storeDeleteForm" class="modal-form" data-id="${dataID}">
          ${StoreInfo({ ...lunchItem, type: "full" })}
          ${FormButtons("storeDelete")}
        </form>
    `;
  }
  return template();
}
function openModal(formName, target) {
  getHTML$1("modalBackground").classList.add("show");
  function template() {
    const templates = {
      storeAdd: () => StoreAddForm({
        id: "restaurantForm",
        label: "새로운 음식점"
      }),
      storeDelete: () => StoreDeleteForm(target.dataset.id)
    };
    const modalHTML = `
    <div class="modal modal--open">
      <div class="modal-container">
        ${templates[formName] ? templates[formName]() : ""}
      </div>
    </div>`;
    return modalHTML;
  }
  function render() {
    const modalHTML = template();
    getHTML$1("modalLayout").innerHTML = "";
    getHTML$1("modalLayout").innerHTML = modalHTML;
  }
  render();
  return { render };
}
const LunchListData = [
  {
    id: crypto.randomUUID(),
    category: "korean",
    name: "피양콩할머니",
    distance: 10,
    description: "2005년 장모님에게 전수받은 설렁탕 조리법을 개선하여 시작했다는 외고집의 설렁탕 맛집입니다. 진하고 깊은 국물 맛과 부드러운 고기가 특징이며, 다양한 밑반찬도 깔끔하게 나옵니다. 특히 깍두기와 배추김치가 잘 어우러져 국물의 감칠맛을 더해줍니다.",
    isFavorite: true
  },
  {
    id: crypto.randomUUID(),
    category: "chinese",
    name: "친친",
    distance: 10,
    description: "Since 2004 편리한 교통과 주차, 그리고 관록만큼 깊은 맛과 정성으로 정통 중식 요리를 선보이는 곳입니다. 대표 메뉴로는 짜장면, 탕수육, 깐풍기가 있으며, 신선한 재료와 풍부한 맛이 특징입니다. 내부 인테리어가 깔끔하고 분위기가 좋아 가족 모임이나 회식 장소로 인기가 많습니다.",
    isFavorite: false
  },
  {
    id: crypto.randomUUID(),
    category: "japanese",
    name: "스시 오마카세",
    distance: 8,
    description: "정통 일본식 스시 오마카세 전문점으로, 숙련된 셰프가 신선한 재료를 사용해 손님 눈앞에서 바로 스시를 준비해 줍니다. 회전율이 빠르고, 고급스러운 분위기에서 제철 재료로 만든 다양한 스시를 즐길 수 있습니다. 예약이 필수이며, 가격대는 높은 편이지만 만족도가 매우 높습니다.",
    isFavorite: true
  },
  {
    id: crypto.randomUUID(),
    category: "western",
    name: "버거 플래닛",
    distance: 5,
    description: "수제 버거 전문점으로, 신선한 재료와 두툼한 패티가 특징입니다. 다양한 토핑 옵션과 사이드 메뉴가 준비되어 있으며, 프라이드 포테이토와 밀크쉐이크도 인기가 많습니다. 매장은 깔끔하고 캐주얼한 분위기로, 친구들과의 모임이나 간단한 식사에 적합합니다.",
    isFavorite: false
  },
  {
    id: crypto.randomUUID(),
    category: "western",
    name: "라 파스타",
    distance: 12,
    description: "이탈리아 전통 방식의 파스타와 피자를 선보이는 레스토랑입니다. 신선한 재료와 자체 제작한 소스를 사용해 깊은 풍미를 자랑합니다. 대표 메뉴로는 까르보나라, 봉골레 파스타, 마르게리타 피자가 있으며, 와인 리스트도 잘 갖춰져 있습니다. 분위기가 로맨틱해 데이트 장소로 인기가 많습니다.",
    isFavorite: true
  },
  {
    id: crypto.randomUUID(),
    category: "korean",
    name: "명동 칼국수",
    distance: 6,
    description: "칼국수 전문점으로, 진한 멸치 육수와 쫄깃한 면발이 특징입니다. 김치가 칼국수와 잘 어울리며, 추가로 왕만두를 함께 주문하면 더욱 든든한 한 끼가 됩니다. 가격이 합리적이며, 빠른 회전율 덕분에 대기 시간이 짧은 편입니다.",
    isFavorite: false
  }
];
class ClickEvent {
  constructor(elem) {
    elem.addEventListener("click", this.onClick.bind(this));
  }
  reload() {
    location.reload();
  }
  resetStorage() {
    if (confirm("저장소를 초기화하시겠습니까?(되돌리기 불가)")) {
      this.reload();
      setStorage("lunchItems", []);
    }
  }
  setDefaultState() {
    if (confirm("기본 식당 데이터를 불러오시겠습니까?")) {
      setStorage("lunchItems", LunchListData);
      this.reload();
    }
  }
  selectTab(target) {
    const tabs = document.querySelectorAll(".tab-item");
    const indicator = document.querySelector(".tab-indicator");
    const container = document.querySelector(".restaurant-section-container");
    const slider = document.querySelector(".restaurant-section-slider");
    const index = Number(target.value);
    tabs.forEach((tab) => {
      tab.classList.remove("active");
    });
    target.classList.add("active");
    indicator.style.left = `${target.offsetLeft}px`;
    indicator.style.width = `${target.offsetWidth}px`;
    slider.scrollTo({
      left: index * container.clientWidth,
      behavior: "smooth"
    });
  }
  showStoreAddModal() {
    openModal("storeAdd");
  }
  showStoreDeleteModal(target) {
    openModal("storeDelete", target);
  }
  removeModal(element) {
    var _a;
    if (element.id === "closeModalBtn") {
      (_a = document.getElementById("modalBackground")) == null ? void 0 : _a.classList.remove("show");
      return;
    }
  }
  toggleFavorite(target) {
    const dataElement = target.closest("[data-id]");
    if (!dataElement) return;
    const dataID = dataElement.dataset.id;
    if (!dataID) return;
    const storageLunchItems = getStorage("lunchItems");
    const targetData = storageLunchItems.find((item) => item.id === dataID);
    targetData.isFavorite = !targetData.isFavorite;
    setStorage("lunchItems", storageLunchItems);
    LunchList().render();
    LunchList().renderFavorites();
    const isModal = target.closest("#storeDeleteForm");
    if (isModal) openModal("storeDelete", dataElement).render();
  }
  onClick(event) {
    let target = event.target.closest("[data-action]");
    if (!target) return;
    if (target.dataset.action && typeof this[target.dataset.action] === "function")
      this[target.dataset.action](target);
  }
}
new ClickEvent(document);
