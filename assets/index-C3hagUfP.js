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
function storageController(storage) {
  function getStorage2(key) {
    const item = storage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return null;
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
function CategoryIcon(category) {
  function template() {
    return `
        <div class="restaurant__category">
            <img src="./public/images/category-${category}.png" alt="${category}" class="category-icon">
        </div>
        `;
  }
  return template();
}
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
function StoreInfo({ name, distance, description, link, isFavorite }, type = "summary") {
  function template() {
    return `
            ${type === "summary" ? `<div class="restaurant__info">` : `<div class="restaurant__info full">`}
            <div class="restaurant__title-box">
              <div class="restaurant__title">
                <h3 class="restaurant__name text-subtitle">${name}</h3>
                <span class="restaurant__distance text-body">캠퍼스부터 ${distance}분 내</span>
              </div>
              ${StarButton(isFavorite)}
            </div>
               
                <p class="restaurant__description text-body">${description || "-"}</p>
                ${link ? `<a href="${link}" target="_blank" class="restaurant__link">${link}</a>` : ""}
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
    ${CategoryIcon(category)}
    ${StoreInfo({
      name,
      distance,
      description,
      link,
      isFavorite
    })}
  `;
    return li;
  }
  return render();
}
function LunchList(targetID = "restaurantListSection") {
  const lunchItems = getStorage("lunchItems");
  console.log("lunchItems )))", getStorage("lunchItems"));
  function template() {
    const ul = createElement("ul");
    ul.classList.add("restaurant-list");
    if (lunchItems.length > 0) {
      lunchItems.forEach((item, index) => {
        ul.appendChild(LunchItem(item, String(index)));
      });
    } else {
      ul.innerHTML = `<p class="empty-message">목록이 없습니다.</p>`;
    }
    return ul.outerHTML;
  }
  function render() {
    console.log("실행됨실행됨");
    getHTML$1(targetID).innerHTML = "";
    getHTML$1(targetID).innerHTML = template();
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
    template
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
RestaurantTabMenu("restaurantMenuSection");
const lunchList = LunchList("restaurantListSection");
lunchList.render();
SubmitEvent(lunchList);
const lunchFavoriteList = LunchList("restaurantFavoriteSection");
lunchFavoriteList.render();
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
  ]
};
function SelectBox({ id, name, label, optionName, required }) {
  const options = SELECT_OPTIONS[optionName] || [];
  function template() {
    return `
      <div class="form-item ${"form-item--required"}">
        <label for="${id}" class="text-caption">${label}</label>
        <select name="${name}" id="${id}" ${"required"}>
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
          ${StoreInfo(lunchItem, "full")}
          ${FormButtons("storeDelete", lunchItemIndex)}
        </form>
    `;
  }
  return template();
}
function openModal(formName, target) {
  const modalHTML = `<div class="modal modal--open">
    <div class="modal-container">
      ${formName === "storeAdd" && StoreAddForm({
    id: "restaurantForm",
    label: "새로운 음식점"
  }) || ""}

      ${formName === "storeDelete" && StoreDeleteForm(Number(target.dataset.index)) || ""}
    </div>
  </div>`;
  getHTML$1("modalLayout").innerHTML = "";
  getHTML$1("modalLayout").innerHTML = modalHTML;
  getHTML$1("modalBackground").classList.add("show");
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
  // deleteStore(target) {
  //   const storageLunchItem = getStorage("lunchItems");
  //   // console.log("target => ", target);
  //   // console.log("타겟의 엘리먼트 li 확인", target.closest("li"));
  //   // const lunchItemIndex = Number(target.closest("li").dataset.value);
  //   storageLunchItem.splice(lunchItemIndex, 1);
  //   setStorage("lunchItems", storageLunchItem);
  //   document.getElementById("modalBackground")?.classList.remove("show");
  // }
  removeModal(element) {
    var _a;
    if (element.id === "closeModalBtn") {
      (_a = document.getElementById("modalBackground")) == null ? void 0 : _a.classList.remove("show");
      return;
    }
  }
  onClick(event) {
    let target = event.target.closest("[data-action]");
    if (!target) return;
    if (target.dataset.action && typeof this[target.dataset.action] === "function")
      this[target.dataset.action](target);
  }
}
new ClickEvent(document);
