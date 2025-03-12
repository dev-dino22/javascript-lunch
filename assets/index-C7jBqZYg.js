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
function StoreInfo({ name, distance, description, link, type }) {
  function template() {
    return `
            ${`<div class="restaurant__info">`}
                <h3 class="restaurant__name text-subtitle">${name}</h3>
                <span class="restaurant__distance text-body">캠퍼스부터 ${distance}분 내</span>
                <p class="restaurant__description text-body">${description || "-"}</p>
                ${link ? `<a href="${link}" target="_blank" class="restaurant__link">${link}</a>` : ""}
            </div>
    `;
  }
  return template();
}
function LunchItem({
  targetID,
  category,
  name,
  distance,
  description,
  link
}) {
  const li = createElement("li");
  li.classList.add("restaurant");
  function render() {
    li.innerHTML = `
    ${CategoryIcon(category)}
    ${StoreInfo({
      name,
      distance,
      description,
      link,
      type: "summary"
    })}
  `;
    return li;
  }
  return render();
}
function LunchList(targetID) {
  const lunchItems = [
    LunchItem({
      category: "etc",
      name: "도스타코스 선릉점",
      distance: 5,
      description: "멕시칸 캐주얼 그릴"
    }),
    LunchItem({
      category: "japanese",
      name: "잇쇼우",
      distance: 10,
      description: "잇쇼우는 정통 자가제면 사누끼 우동이 대표메뉴입니다. 기술은 정성을 이길 수 없다는 신념으로 모든 음식에 최선을 다하는 잇쇼우는 고객 한분 한분께 최선을 다하겠습니다"
    })
  ];
  const ul = createElement("ul");
  ul.classList.add("restaurant-list");
  function template() {
    if (lunchItems.length > 0) {
      lunchItems.forEach((item) => {
        ul.appendChild(item);
      });
    } else {
      ul.innerHTML = `<p class="empty-message">목록이 없습니다.</p>`;
    }
    return ul.outerHTML;
  }
  function render() {
    getHTML$1(targetID).innerHTML = "";
    getHTML$1(targetID).innerHTML = template();
  }
  function addRestaurantItem({ category, name, distance, description, link }) {
    const newItem = LunchItem({ category, name, distance, description, link });
    lunchItems.push(newItem);
    ul.appendChild(newItem);
    render();
  }
  return {
    render,
    addRestaurantItem,
    template
  };
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
    form.reset();
  }
}
const lunchList = LunchList("restaurantListSection");
lunchList.render();
SubmitEvent(lunchList);
function Button({ id, type, content, dataSet, styleType }) {
  const classList = styleType === "primary" ? "button button--primary text-caption" : "button button--secondary text-caption";
  function template() {
    return `
        <button 
          ${id ? `id="${id}"` : ""} 
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
function FormButtons({ formName }) {
  const storeAddBtns = `${Button({ id: "closeModalBtn", type: "button", content: "취소하기", dataSet: "removeModal" })}
                ${Button({ type: "submit", content: "추가하기", styleType: "primary" })}`;
  function template() {
    return `
    <div id="buttonContainer" class="button-container" >
        ${storeAddBtns || ""}
        ${""}
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
function FormBox({ id, formName, label }) {
  function template() {
    return `
        ${`<h2 class="modal-title text-title">새로운 음식점</h2>`}
        <form id="${id}" class="modal-form">
          ${storeAddTemplate || ""}
          ${""}
          ${FormButtons({ formName })}
        </form>
    `;
  }
  return template();
}
const storeAddTemplate = `
      <!-- 카테고리 -->
        ${SelectBox({
  id: "category",
  name: "category",
  label: "카테고리",
  optionName: "category",
  required: true
})}

        <!-- 음식점 이름 -->
        ${InputBox({
  name: "name",
  id: "name",
  required: true,
  label: "이름",
  placeHolder: "파양콩 할마니",
  maxLength: 15,
  type: "text"
})}

        <!-- 거리 -->
        ${SelectBox({
  id: "distance",
  name: "distance",
  label: "거리(도보 이동 시간)",
  optionName: "distance",
  required: true
})}

        <!-- 설명 -->
        ${TextareaBox({
  id: "description",
  name: "description",
  label: "설명",
  required: false,
  cols: "30",
  rows: "5",
  helpCaption: "메뉴 등 추가 정보를 입력해 주세요."
})}

        <!-- 링크 -->
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
function openModal(formName) {
  const modalHTML = `<div class="modal modal--open">
    <div class="modal-container">
      ${FormBox({ id: "restaurantForm", formName, label: "새로운 음식점" })}
    </div>
  </div>`;
  getHTML$1("modalBackground").innerHTML = "";
  getHTML$1("modalBackground").innerHTML = modalHTML;
  getHTML$1("modalBackground").classList.add("show");
}
class ClickEvent {
  constructor(elem) {
    elem.addEventListener("click", this.onClick.bind(this));
  }
  reload() {
    location.reload();
  }
  showStoreAddModal() {
    openModal("storeAdd");
  }
  removeModal(element) {
    var _a;
    if (element.id === "closeModalBtn") {
      (_a = document.getElementById("modalBackground")) == null ? void 0 : _a.classList.remove("show");
      return;
    }
  }
  copyContent(element) {
    const textCopy = element.querySelector("p").textContent;
    if (!textCopy) {
      alert("복사할 내용이 없습니다.");
      return;
    }
    navigator.clipboard.writeText(textCopy).then(() => alert("해당 로또 번호가 복사되었습니다.")).catch(() => alert("로또 번호 복사에 실패하였습니다."));
  }
  onClick(event) {
    let target = event.target.closest("[data-action]");
    if (!target) return;
    if (target.dataset.action && typeof this[target.dataset.action] === "function")
      this[target.dataset.action](target);
  }
}
new ClickEvent(document);
