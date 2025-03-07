var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
class Component {
  constructor(props) {
    __publicField(this, "props");
    __publicField(this, "state");
    __publicField(this, "children");
    this.props = props;
    this.children = [];
    this.setDefaultProps();
    this.initState();
    this.setEvent();
  }
  initState() {
    this.state = {};
  }
  addChild(Component2, ...args) {
    const component = new Component2(...args);
    this.children.push(component);
    return component;
  }
  template() {
    return "";
  }
  setEvent() {
  }
  setDefaultProps() {
    this.props = {};
  }
  setProps(newProps) {
    this.props = {
      ...this.props,
      ...newProps
    };
  }
  setState(newState) {
    this.state = {
      ...this.state,
      ...newState
    };
    this.render();
  }
  render(props, targetElement = "#app") {
    if (props) this.setProps(props);
    const container = document.querySelector(targetElement);
    container.innerHTML = this.template(this.props);
    return container;
  }
}
const styleStr = (styles) => Object.entries(styles).map(([key, value]) => `${key}: ${value};`).join(" ");
class Text extends Component {
  setDefaultProps() {
    this.props = {
      content: "",
      required: false,
      classList: [],
      styles: {},
      id: "init"
    };
  }
  template() {
    const { content, required, classList, styles, id } = this.props;
    return `
      <p
        id="${id}"
        class="${classList.join(" ")}" 
        style="${styleStr(styles)}"
      >
        ${content} ${required ? `<span style="color: red;">*</span>` : ""}
      </p>`;
  }
}
class Select extends Component {
  setDefaultProps() {
    this.props = {
      options: [],
      onChange: () => {
      },
      classList: [],
      styles: {},
      id: "init"
    };
  }
  initState() {
    this.state = { isOpen: false, selected: "" };
  }
  setState(newState) {
    var _a;
    const { id } = this.props;
    this.state = { ...this.state, ...newState };
    const bottomSheetContent = document.getElementById("bottom-sheet-content");
    const bottomSheetButton = bottomSheetContent.querySelector(`#${id}-button`);
    const container = bottomSheetButton.closest(".relative");
    (_a = container.querySelector(`#${id}-dropdown`)) == null ? void 0 : _a.remove();
    bottomSheetButton.innerHTML = `
      ${this.state.selected || "선택해주세요"}
      <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" style="transition: transform 0.2s; ${this.state.isOpen ? "transform: rotate(180deg);" : ""}">
        <path d="M5 8L10 13L15 8" stroke="#667085" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
    if (this.state.isOpen)
      container.insertAdjacentHTML("beforeend", this.renderDropDownItem());
  }
  toggleDropdown() {
    this.setState({ isOpen: !this.state.isOpen });
  }
  selectOption(option) {
    this.setState({ selected: option, isOpen: false });
    this.props.onChange(option);
  }
  setEvent() {
    document.addEventListener("click", (e) => {
      if (e.target.id === `${this.props.id}-button`) {
        return this.toggleDropdown();
      }
      const option = e.target.closest(`#${this.props.id}-dropdown li`);
      if (option) {
        this.selectOption(option.dataset.value);
      }
    });
  }
  renderDropDownItem() {
    const { options, classList, styles, id } = this.props;
    if (!this.state.isOpen) return "";
    return `
      <ul 
        id="${id}-dropdown"
        class=" dropdown-shadow ${classList.join(
      " "
    )} min-h-44 absolute w-full bg-white border rounded-lg mt-8 left-0 overflow-y"
        style="top: 100%; z-index: 100; list-style: none; max-height: 200px;
         ${styleStr(styles)}"
        >
        ${options.map(
      (option) => `<li data-value="${option}" class="cursor-pointer py-16 px-8">${option}</li>`
    ).join("")}
      </ul>
    `;
  }
  template() {
    const { id } = this.props;
    const { isOpen, selected } = this.state;
    return `
      <div class="relative w-full flex flex-col">
        <button type="button" id="${id}-button" class="w-full h-44 flex items-center justify-between cursor-pointer border rounded-lg bg-white text-lg">
          ${selected || "선택해주세요"}
          <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" style="transition: transform 0.2s; ${isOpen ? "transform: rotate(180deg);" : ""}">
            <path d="M5 8L10 13L15 8" stroke="#667085" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        ${this.renderDropDownItem()} 
      </div>
    `;
  }
}
class TextArea extends Component {
  setDefaultProps() {
    this.props = {
      rows: 1,
      maxLength: 10,
      placeHolder: "",
      onInput: () => {
      },
      classList: [],
      styles: {},
      id: "init",
      isRequired: false
    };
  }
  setEvent() {
    if (!this.props) return;
    document.removeEventListener("input", this.handleInput);
    this.handleInput = (e) => {
      if (e.target.id === this.props.id) {
        this.props.onInput(e.target.value);
      }
    };
    document.addEventListener("input", this.handleInput);
  }
  template() {
    const { isRequired, rows, maxLength, placeHolder, classList, styles, id } = this.props;
    return `
      <textarea 
        ${isRequired && "required"}
        autofocus
        id="${id}"
        name="${id}"
        rows="${rows}"
        maxlength="${maxLength}"
        placeholder="${placeHolder}"
        class="${classList.join(
      " "
    )} w-full border px-8 py-8 box-border text-lg"
        style="${styleStr(styles)}"
      ></textarea>
    `;
  }
}
const primary = ["bg-primary-500", "white", "border-none"];
const secondary = ["bg-white", "slate-400", "border", "border-slate-400"];
class Button extends Component {
  setDefaultProps() {
    this.props = {
      text: "",
      variant: "primary",
      disabled: false,
      onClick: () => {
      },
      styles: {},
      id: ""
    };
  }
  setEvent() {
    if (!this.props) return;
    document.addEventListener("input", (e) => {
      if (e.target.closest(`#${this.props.id}`)) {
        this.props.onClick();
      }
    });
  }
  template() {
    const { text, variant, disabled, styles, id } = this.props;
    return `
      <button 
        id="${id}"  
        type="submit"
        ${disabled && "disabled"} 
        class="${variant === "primary" ? primary.join(" ") : secondary.join(" ")} w-full h-44 flex justify-center items-center text-lg rounded-lg cursor-pointer"
        style="${styleStr(styles)}"
      >
        ${text}
      </button>
    `;
  }
}
const ValidationUtils = {
  isEmpty: (string) => string.trim().length === 0,
  isValidURL: (string) => {
    const expUrl = /https?:\/\/[^\s"]/;
    return expUrl.test(string);
  }
};
const Validator = {
  category: (string) => {
    if (ValidationUtils.isEmpty(string))
      throw new Error("카테고리를 선택해주세요.");
  },
  location: (string) => {
    if (ValidationUtils.isEmpty(string))
      throw new Error("거리(도보 이동 시간)을 선택해주세요.");
  },
  reference: (string) => {
    if (!ValidationUtils.isValidURL(string) && string.length !== 0)
      throw new Error("https를 포함한 올바른 링크를 입력해주세요.");
  }
};
class LunchForm extends Component {
  setDefaultProps() {
    this.props = {
      onAdd: () => {
      }
    };
  }
  initState() {
    this.state = {
      category: "",
      storeName: "",
      location: "",
      description: "",
      reference: ""
    };
  }
  renderLunchText() {
    const lunchText = this.addChild(Text);
    lunchText.setProps({
      content: "새로운 음식점",
      classList: ["w-full", "text-2xl"],
      id: "lunch-form-title"
    });
    return lunchText.template();
  }
  renderCategory() {
    const categoryLabel = this.addChild(Text);
    categoryLabel.setProps({
      content: "카테고리",
      required: true,
      classList: ["text-lg", "slate-500"],
      id: "category-label"
    });
    const categorySelect = this.addChild(Select);
    categorySelect.setProps({
      options: ["한식", "중식", "일식", "아시안", "양식", "기타"],
      onChange: (value) => this.setState({ category: value }),
      id: "category-select"
    });
    return `
    <div class="w-full h-64 flex flex-col">
      ${categoryLabel.template()}
      ${categorySelect.template()}
    </div>
    `;
  }
  renderStoreName() {
    const storeNameLabel = this.addChild(Text);
    storeNameLabel.setProps({
      content: "이름",
      required: true,
      classList: ["text-lg", "slate-500"],
      id: "store-name-label"
    });
    const storeName = this.addChild(TextArea);
    storeName.setProps({
      rows: 1,
      maxLength: 14,
      placeHolder: "피양콩할마니",
      onInput: (value) => this.setState({ storeName: value }),
      classList: ["h-44", "rounded-lg", "resize-none"],
      id: "store-name-textarea",
      isRequired: true
    });
    return `
      <div class="w-full flex flex-col">
        ${storeNameLabel.template()}
        ${storeName.template()}
      </div>
    `;
  }
  renderLocation() {
    const locationLabel = this.addChild(Text);
    locationLabel.setProps({
      content: "거리(도보 이동 시간)",
      required: true,
      classList: ["text-lg", "slate-500"],
      id: "location-label"
    });
    const location2 = this.addChild(Select);
    location2.setProps({
      options: ["5분", "10분", "15분", "20분", "30분"],
      onChange: (value) => this.setState({ location: value }),
      id: "location-select"
    });
    return `
        <div class="w-full h-64 flex flex-col">
          ${locationLabel.template()}
          ${location2.template()}
        </div>
    `;
  }
  renderDescription() {
    const descriptionLabel = this.addChild(Text);
    descriptionLabel.setProps({
      content: "설명",
      required: false,
      classList: ["text-lg", "slate-500"],
      id: "description-label"
    });
    const description = this.addChild(TextArea);
    description.setProps({
      rows: 3,
      maxLength: 255,
      isRequired: false,
      placeHolder: "설명을 입력해주세요. 설명은 최대 255글자까지 가능합니다.",
      onInput: (value) => this.setState({ description: value }),
      classList: ["h-90", "rounded-lg", "resize-none"],
      id: "description-textarea"
    });
    return `
      <div class="w-full flex flex-col">
        ${descriptionLabel.template()}
        ${description.template()}
      </div>
    `;
  }
  renderReference() {
    const referenceLabel = this.addChild(Text);
    referenceLabel.setProps({
      content: "참고 링크",
      classList: ["text-lg", "slate-500"],
      id: "reference-label"
    });
    const reference = this.addChild(TextArea);
    reference.setProps({
      rows: 1,
      maxLength: 100,
      isRequired: false,
      placeHolder: "https://techcourse.woowahan.com/",
      onInput: (value) => this.setState({ reference: value }),
      classList: ["h-44", "rounded-lg", "resize-none"],
      id: "reference-textarea"
    });
    return `
      <div class="w-full flex flex-col">
        ${referenceLabel.template()}
        ${reference.template()}
      </div>
    `;
  }
  renderButton() {
    const cancelBtn = this.addChild(Button);
    cancelBtn.setProps({
      text: "취소하기",
      variant: "secondary",
      classList: ["w-full"],
      onClick: () => this.handleReset(),
      id: "cancel-btn"
    });
    const submitBtn = this.addChild(Button);
    submitBtn.setProps({
      text: "추가하기",
      variant: "primary",
      classList: ["w-full"],
      onClick: (e) => this.handleSubmit(e),
      id: "submit-btn"
    });
    return `
        <div class="w-full flex gap-16 flex-row justify-between items-center">
          ${cancelBtn.template()}
          ${submitBtn.template()}
        </div>
      `;
  }
  handleSubmit(e) {
    e.preventDefault();
    const { onAdd } = this.props;
    this.validateLunchForm();
    this.props.onAdd({ ...this.state });
    this.handleReset();
  }
  handleReset() {
    this.setState({
      category: "",
      storeName: "",
      location: "",
      description: "",
      reference: ""
    });
  }
  validateLunchForm() {
    Validator.category(this.state.category);
    Validator.location(this.state.location);
    Validator.reference(this.state.reference);
  }
  template() {
    return `
    <form id="lunch-form" class="flex flex-col justify-start items-start gap-32 mt-32" >
      ${this.renderLunchText()}
      ${this.renderCategory()}
      ${this.renderStoreName()}
      ${this.renderLocation()}
      ${this.renderDescription()}    
      ${this.renderReference()}
      ${this.renderButton()}
    </form>
    `;
  }
  render(props) {
  }
}
class BottomSheet extends Component {
  setDefaultProps() {
    this.props = {
      isOpen: false,
      onAdd: () => {
      }
    };
  }
  initState() {
    var _a;
    this.state = {
      isOpen: ((_a = this.props) == null ? void 0 : _a.isOpen) || false
    };
  }
  open() {
    const bottomSheetContainer = document.getElementById("bottom-sheet");
    bottomSheetContainer.innerHTML = this.template(true);
    this.addBottomSheetEvents();
    this.children.map((child) => {
      child.setProps({
        onAdd: this.props.onAdd
      });
    });
  }
  close() {
    const bottomSheetContainer = document.getElementById("bottom-sheet");
    if (bottomSheetContainer) {
      bottomSheetContainer.innerHTML = "";
    }
  }
  addBottomSheetEvents() {
    const overlay = document.querySelector("#bottom-sheet-overlay");
    const bottomSheetContent = document.getElementById("bottom-sheet-content");
    overlay == null ? void 0 : overlay.addEventListener(
      "click",
      (e) => !bottomSheetContent.contains(e.target) && this.close()
    );
    const cancelButton = document.getElementById("cancel-btn");
    cancelButton == null ? void 0 : cancelButton.addEventListener("click", () => {
      this.close();
    });
    const lunchForm = document.getElementById("lunch-form");
    lunchForm == null ? void 0 : lunchForm.addEventListener("submit", (e) => {
      this.children.map((child) => {
        try {
          child.handleSubmit(e);
          this.close();
        } catch (e2) {
          alert(e2.message);
        }
      });
    });
  }
  template(isOpen = this.props.isOpen) {
    if (!isOpen) return "";
    return `
      <div id="bottom-sheet-open">
        <div 
          id="bottom-sheet-overlay"
          class="w-full h-full fixed top-0 left-0"
          style="background-color: rgba(0, 0, 0, 0.5);"
        />
        <div
          class="w-full fixed flex justify-center bottom-0 left-0"
          style="height: 80%; z-index: 50;"
        >
          <div 
            id="bottom-sheet-content"
            class="relative max-w-390 w-full flex flex-col bg-white overflow-y px-16 box-border"
            style="z-index: 50; border-top-left-radius: 16px; border-top-right-radius: 16px; 
              animation: slideUp 300ms ease-out forwards;"
          >
            ${this.children.map((child) => child.template()).join("")}
          </div>
        </div>
      </div>
    `;
  }
  render(props) {
    super.render(props, "#bottom-sheet");
  }
}
class Icon extends Component {
  setDefaultProps() {
    this.props = {
      size: "40",
      iconName: "",
      classList: [],
      styles: {},
      id: "init"
    };
  }
  template() {
    const { size, iconName, classList, styles, id } = this.props;
    return `
      <img
        id="${id}"
        width="${size}"
        height="${size}"
        alt="${iconName}"
        src="./public/${iconName}.png"
        class=" ${classList.join(" ")} cursor-pointer" 
        style="${styleStr(styles)}"
      />
      `;
  }
}
class CircleIcon extends Component {
  setDefaultProps() {
    this.props = {
      iconName: "",
      size: "64",
      classList: [],
      styles: {},
      id: "init"
    };
  }
  renderIcon() {
    const icon = new Icon();
    icon.setProps({
      iconName: this.props.iconName
    });
    return icon.template();
  }
  template() {
    const { iconName, classList, styles, id } = this.props;
    return `
      <span id="${id}" class="w-64 h-64 flex justify-center items-center rounded-full bg-primary-300">
        ${this.renderIcon()}
      </span>
      `;
  }
}
class Header extends Component {
  setDefaultProps() {
    this.props = {
      title: "",
      iconName: "",
      onIconClick: () => {
      }
    };
  }
  renderText() {
    const text = this.addChild(Text);
    text.setProps({
      content: this.props.title,
      classList: ["text-2xl cursor-pointer"],
      id: "header-text"
    });
    return text.template();
  }
  renderIcon() {
    const icon = this.addChild(Icon);
    icon.setProps({
      iconName: this.props.iconName,
      id: "header-icon"
    });
    return icon.template();
  }
  setEvent() {
    document.addEventListener("click", (event) => {
      const headerIcon = document.querySelector("#header-icon");
      if (headerIcon === event.target) {
        this.props.onIconClick();
      }
      const titleText = document.querySelector("#header-text");
      if (titleText === event.target) {
        location.reload();
      }
    });
  }
  template() {
    return `
    <header class="w-full h-64 flex justify-between items-center bg-primary-500 white px-16 box-border">
      ${this.renderText()}
      ${this.renderIcon()}
    </header>
    `;
  }
}
class Layout extends Component {
  setDefaultProps() {
    this.props = {
      children: []
    };
  }
  template() {
    const { children } = this.props;
    return `
    <main class="max-w-390 w-full h-full flex flex-col justify-center items-center mx-16">
    ${children.map((child) => child.template()).join("")}
    </main>`;
  }
}
const CATEGORY_IMAGE = {
  한식: "category-korean",
  중식: "category-chinese",
  일식: "category-japanese",
  아시안: "category-asian",
  양식: "category-western",
  기타: "category-etc"
};
const match = (str) => {
  return CATEGORY_IMAGE[str];
};
class LunchItem extends Component {
  setDefaultProps() {
    this.props = {
      storeName: "",
      location: "",
      category: "",
      description: "",
      reference: ""
    };
  }
  renderStoreName() {
    const storeName = this.addChild(Text);
    storeName.setProps({
      content: this.props.storeName,
      classList: ["text-xl"],
      id: "store-name-item"
    });
    return storeName.template();
  }
  renderLocation() {
    const location2 = this.addChild(Text);
    location2.setProps({
      content: this.props.location,
      classList: ["text-lg", "primary-500"],
      id: "location-item"
    });
    return location2.template();
  }
  renderDescription() {
    if (!this.props.description) return "";
    const description = this.addChild(Text);
    description.setProps({
      content: this.props.description,
      classList: ["text-lg", "my-8"],
      styles: {
        display: "-webkit-box",
        "-webkit-line-clamp": 2,
        "-webkit-box-orient": "vertical"
      },
      id: "description-item"
    });
    return description.template();
  }
  renderCircleIcon() {
    const icon = this.addChild(CircleIcon);
    icon.setProps({
      iconName: match(this.props.category),
      id: "category-item"
    });
    return icon.template();
  }
  template() {
    return `
      <div id="lunch-item" class="flex flex-row w-full items-start gap-16 py-16 px-8 border-b" style="height: auto;">
        <div>
          ${this.renderCircleIcon()}
        </div>
        <div class="flex flex-col overflow-hidden" style="width: 262px;">
          ${this.renderStoreName()}
          ${this.renderLocation()}
          ${this.renderDescription()}
        </div>
      </div>
    `;
  }
}
class LunchList extends Component {
  initState() {
    this.state = {
      items: []
    };
  }
  setProps(newProps) {
    if (newProps.lunchList) {
      this.setState({
        items: newProps.lunchList
      });
    }
  }
  addLunchItem(newItem) {
    this.setState({
      items: [...this.state.items, newItem]
    });
    const restaurantList = document.getElementById("restaurant-list");
    if (restaurantList) {
      restaurantList.innerHTML = this.renderItems();
    }
  }
  renderItems() {
    return this.state.items.map((item) => {
      return item.template();
    }).join("");
  }
  renderCircleIcon() {
    const icon = this.addChild(CircleIcon);
    icon.setProps({
      iconName: "category-korean"
    });
    return icon.template();
  }
  template() {
    return `
      <section class="w-full flex flex-col justify-center items-center my-16 overflow-y">
        <ul id="restaurant-list">
          <div class="flex flex-col items-center justify-center gap-16 mt-32">
            ${this.renderCircleIcon()}
            <p class="text-xl">아직 추가된 음식점이 없습니다.</p>
          </div>
        </ul>
      </section>
    `;
  }
  render(props) {
  }
}
addEventListener("load", () => {
  const layout = new Layout();
  const header = new Header();
  const lunchList = new LunchList();
  const bottomSheet = new BottomSheet();
  bottomSheet.setProps({
    onAdd: (data) => {
      const newLunchItem = new LunchItem();
      newLunchItem.setProps(data);
      lunchList.addLunchItem(newLunchItem);
    }
  });
  new LunchForm();
  bottomSheet.addChild(LunchForm);
  header.setProps({
    title: "점심 뭐먹지",
    iconName: "add-button",
    onIconClick: () => bottomSheet.open()
  });
  layout.setProps({
    children: [header, lunchList]
  });
  layout.render();
});
