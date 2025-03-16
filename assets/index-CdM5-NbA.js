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
  let filtered = items.map((item, index) => ({
    ...item,
    dataIndex: index
  }));
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
  type,
  index
}) {
  function template() {
    return `
        ${CategoryIcon(category)}
            ${type === "summary" ? `<div class="restaurant__info">` : `<div class="restaurant__info full" data-index="${index}">`}
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
function LunchItem({ category, name, distance, description, link, isFavorite }, index) {
  const li = createElement("li");
  li.classList.add("restaurant");
  li.setAttribute("data-action", "showStoreDeleteModal");
  li.setAttribute("data-index", index);
  function render() {
    li.innerHTML = `
    ${StoreInfo({
      category,
      name,
      distance,
      description,
      link,
      type: "summary",
      isFavorite,
      index
    })}
  `;
    return li;
  }
  return render();
}
function LunchList(lunchListID = "restaurantListBox", favoriteTargetID = "restaurantFavoriteSection") {
  const lunchItems = getStorage("lunchItems") ?? [];
  function updateFilter(newState) {
    updateFilterState(newState);
    render();
  }
  function template(items) {
    const ul = createElement("ul");
    ul.classList.add("restaurant-list");
    if (items.length > 0) {
      items.forEach((item) => {
        const dataIndex = item.dataIndex ?? 0;
        ul.appendChild(LunchItem(item, String(dataIndex)));
      });
    } else {
      ul.innerHTML = `
      <div class="empty-info-container">
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
    const filteredItems = sortFilter(lunchItems ?? []);
    const ul = template(filteredItems);
    getHTML$1(lunchListID).innerHTML = "";
    getHTML$1(lunchListID).innerHTML = ul.outerHTML;
  }
  function renderFavorites() {
    const favorites = lunchItems.map((item, index) => ({ ...item, dataIndex: index })).filter((item) => item.isFavorite);
    const items = favorites.map((item) => {
      const { dataIndex, ...rest } = item;
      return rest;
    });
    const ul = template(items);
    getHTML$1(favoriteTargetID).innerHTML = "";
    getHTML$1(favoriteTargetID).appendChild(ul);
  }
  function addRestaurantItem({
    category,
    name,
    distance,
    description,
    link
  }) {
    const newItem = {
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
        lunchList2.updateFilter({ sortOption: target.value });
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
    lunchList2.addRestaurantItem({
      category,
      name,
      distance,
      description,
      link
    });
    closeModal();
  }
  function deleteStore(event, form) {
    var _a;
    const lunchItemIndex = (_a = event.submitter) == null ? void 0 : _a.value;
    const storageLunchItems = getStorage("lunchItems");
    storageLunchItems.splice(lunchItemIndex, 1);
    setStorage("lunchItems", storageLunchItems);
    LunchList().render();
    LunchList().renderFavorites();
    closeModal();
  }
  function closeModal() {
    const modalBackground = getHTML("modalBackground");
    modalBackground.classList.remove("show");
  }
  function onSubmit(event) {
    event.preventDefault();
    const form = event.target.closest(".modal-form");
    if (!form) return;
    if (form.id === "restaurantForm") {
      handleRestaurantSubmit(event, form);
    }
    if (form.id === "storeDeleteForm") {
      deleteStore(event);
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
function FormButtons(formName, buttonValue) {
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
    dataSet: "deleteStore",
    buttonValue
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
function StoreDeleteForm(lunchItemIndex) {
  const lunchItem = getStorage("lunchItems")[lunchItemIndex];
  function template() {
    return `
        <form id="storeDeleteForm" class="modal-form">
          ${StoreInfo({ ...lunchItem, type: "full", index: lunchItemIndex })}
          ${FormButtons("storeDelete", lunchItemIndex)}
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
      storeDelete: () => StoreDeleteForm(Number(target == null ? void 0 : target.dataset.index))
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
class ClickEvent {
  constructor(elem) {
    elem.addEventListener("click", this.onClick.bind(this));
  }
  reload() {
    location.reload();
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
    const indexElement = target.closest("[data-index]");
    if (!indexElement) return;
    const index = indexElement.getAttribute("data-index");
    if (!index) return;
    indexElement.getAttribute("data-favorite") === "true";
    const storageLunchItems = getStorage("lunchItems");
    storageLunchItems[index].isFavorite = !storageLunchItems[index].isFavorite;
    setStorage("lunchItems", storageLunchItems);
    LunchList().render();
    LunchList().renderFavorites();
    const isModal = target.closest("#storeDeleteForm");
    if (isModal) openModal("storeDelete", indexElement).render();
  }
  onClick(event) {
    let target = event.target.closest("[data-action]");
    if (!target) return;
    if (target.dataset.action && typeof this[target.dataset.action] === "function")
      this[target.dataset.action](target);
  }
}
new ClickEvent(document);
