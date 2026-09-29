const menuButton=document.querySelector(".menu-toggle");
const tabletMenu=document.querySelector("#tablet-menu");
const menuOverlay=document.querySelector("#menu-overlay");

function setMenu(open){
  if(!menuButton||!tabletMenu)return;
  menuButton.setAttribute("aria-expanded",String(open));
  menuButton.setAttribute("aria-label",open?"Закрыть меню":"Открыть меню");
  tabletMenu.hidden=!open;
  if(menuOverlay)menuOverlay.hidden=!open;
}

menuButton?.addEventListener("click",()=>{
  const open=menuButton.getAttribute("aria-expanded")==="true";
  setMenu(!open);
});

menuOverlay?.addEventListener("click",()=>setMenu(false));

tabletMenu?.querySelectorAll("a").forEach(link=>{
  link.addEventListener("click",()=>setMenu(false));
});

document.addEventListener("keydown",event=>{
  if(event.key==="Escape")setMenu(false);
});

const siteShell=document.querySelector(".site-shell");

function updateDesktopScale(){
  if(!siteShell)return;
  const viewport=window.innerWidth;

  if(viewport>=769&&viewport<1920){
    const scale=viewport/1920;
    siteShell.style.transform=`scale(${scale})`;
    document.body.style.height=`${Math.ceil(siteShell.scrollHeight*scale)}px`;
  }else{
    siteShell.style.transform="";
    document.body.style.height="";
  }

  if(viewport>768)setMenu(false);
}

updateDesktopScale();
window.addEventListener("resize",updateDesktopScale);
window.addEventListener("load",updateDesktopScale);

document.querySelectorAll(".faq-item .faq-toggle").forEach(button=>{
  button.addEventListener("click",()=>{
    const answer=document.getElementById(button.getAttribute("aria-controls"));
    if(!answer)return;
    const open=button.getAttribute("aria-expanded")!=="true";
    answer.hidden=!open;
    button.setAttribute("aria-expanded",String(open));
    button.setAttribute("aria-label",`${open?"Скрыть":"Показать"} ответ: ${button.closest(".faq-item")?.querySelector("h3")?.textContent||""}`);
    button.querySelector(".faq-arrow").src=open?"client-faq-arrow-up.svg":"client-faq-arrow-down.svg";
    button.closest(".faq-item")?.classList.toggle("is-open",open);
    updateDesktopScale();
  });
});

const homePortfolioTrack=document.querySelector(".portfolio-section .portfolio-grid");
const homePortfolioMobile=window.matchMedia("(max-width: 430px)");

if(homePortfolioTrack){
  const photos=[...homePortfolioTrack.querySelectorAll(":scope > picture")];
  const edgeCount=2;
  let ready=false;
  let settleTimer;

  function portfolioStep(){
    const gap=parseFloat(getComputedStyle(homePortfolioTrack).columnGap)||0;
    return photos[0].getBoundingClientRect().width+gap;
  }

  function jumpToPortfolio(position){
    homePortfolioTrack.style.scrollSnapType="none";
    homePortfolioTrack.scrollLeft=position;
    requestAnimationFrame(()=>{homePortfolioTrack.style.scrollSnapType="";});
  }

  function wrapHomePortfolio(){
    if(!homePortfolioMobile.matches||!ready)return;
    const step=portfolioStep();
    const index=Math.round(homePortfolioTrack.scrollLeft/step);
    if(index<edgeCount)jumpToPortfolio((index+photos.length)*step);
    else if(index>=edgeCount+photos.length)jumpToPortfolio((index-photos.length)*step);
  }

  function initHomePortfolio(){
    if(!homePortfolioMobile.matches||photos.length<3)return;
    if(!ready){
      const clone=photo=>{
        const copy=photo.cloneNode(true);
        copy.classList.add("portfolio-clone");
        copy.querySelector("img").alt="";
        copy.setAttribute("aria-hidden","true");
        return copy;
      };
      photos.slice(-edgeCount).reverse().forEach(photo=>homePortfolioTrack.insertBefore(clone(photo),homePortfolioTrack.firstChild));
      photos.slice(0,edgeCount).forEach(photo=>homePortfolioTrack.appendChild(clone(photo)));
      ready=true;
    }
    jumpToPortfolio(edgeCount*portfolioStep());
  }

  homePortfolioTrack.addEventListener("scroll",()=>{
    clearTimeout(settleTimer);
    settleTimer=setTimeout(wrapHomePortfolio,180);
  },{passive:true});
  homePortfolioTrack.addEventListener("scrollend",wrapHomePortfolio);
  homePortfolioTrack.addEventListener("keydown",event=>{
    if(!homePortfolioMobile.matches||!["ArrowLeft","ArrowRight"].includes(event.key))return;
    event.preventDefault();
    homePortfolioTrack.scrollBy({left:(event.key==="ArrowRight"?1:-1)*portfolioStep(),behavior:"smooth"});
  });
  homePortfolioMobile.addEventListener("change",initHomePortfolio);
  initHomePortfolio();
}

const portfolioGallery=document.querySelector(".portfolio-gallery");
const portfolioMore=portfolioGallery?.querySelector(".portfolio-more");
const portfolioImages=[...portfolioGallery?.querySelectorAll(".portfolio-grid img")||[]];
const portfolioFilters=[...portfolioGallery?.querySelectorAll(".portfolio-filters button")||[]];
const portfolioEmpty=portfolioGallery?.querySelector(".portfolio-empty");
let portfolioFilter="all";
let portfolioExpanded=false;

function updatePortfolio(){
  if(!portfolioGallery)return;
  const mobile=window.matchMedia("(max-width: 430px)").matches;
  if(!mobile){portfolioFilter="all";portfolioExpanded=false;}
  const matches=portfolioImages.filter(img=>portfolioFilter==="all"||img.dataset.tags?.split(" ").includes(portfolioFilter));
  portfolioImages.forEach(img=>{
    img.hidden=mobile&&!matches.includes(img);
  });
  portfolioGallery.classList.toggle("is-expanded",mobile&&(portfolioExpanded||portfolioFilter!=="all"));
  if(portfolioMore){
    portfolioMore.hidden=mobile&&(portfolioFilter!=="all"||matches.length<=6);
    portfolioMore.setAttribute("aria-expanded",String(portfolioExpanded));
    portfolioMore.textContent=portfolioExpanded?"Свернуть":"Показать ещё";
  }
  if(portfolioEmpty)portfolioEmpty.hidden=!mobile||matches.length>0;
  portfolioFilters.forEach(button=>{
    const active=button.dataset.filter===portfolioFilter;
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-pressed",String(active));
  });
}

portfolioMore?.addEventListener("click",()=>{
  if(!window.matchMedia("(max-width: 430px)").matches)return;
  portfolioExpanded=!portfolioExpanded;
  updatePortfolio();
});

portfolioFilters.forEach(button=>button.addEventListener("click",()=>{
  if(!window.matchMedia("(max-width: 430px)").matches)return;
  portfolioFilter=button.dataset.filter;
  portfolioExpanded=false;
  updatePortfolio();
}));

if(portfolioGallery){
  updatePortfolio();
  window.addEventListener("resize",updatePortfolio);
}

const meaningsCatalog=document.querySelector(".meanings-catalog");
const meaningCards=[...meaningsCatalog?.querySelectorAll(".meaning-card")||[]];
const meaningFilters=[...meaningsCatalog?.querySelectorAll(".meanings-filters button")||[]];
const meaningsMore=meaningsCatalog?.querySelector(".meanings-more");
const meaningsEmpty=meaningsCatalog?.querySelector(".meanings-empty");
let meaningFilter="all";
let meaningsExpanded=false;

function updateMeanings(){
  if(!meaningsCatalog)return;
  const mobile=window.matchMedia("(max-width: 430px)").matches;
  if(!mobile){meaningFilter="all";meaningsExpanded=false;}
  const matching=meaningCards.filter(card=>meaningFilter==="all"||card.dataset.category===meaningFilter);
  meaningCards.forEach(card=>{
    card.hidden=mobile&&(!matching.includes(card)||(meaningFilter==="all"&&!meaningsExpanded&&!card.classList.contains("is-featured")));
  });
  if(meaningsMore){
    meaningsMore.hidden=mobile&&(meaningFilter!=="all"||meaningCards.length<=4);
    meaningsMore.setAttribute("aria-expanded",String(meaningsExpanded));
    meaningsMore.textContent=meaningsExpanded?"Свернуть":"Показать ещё";
  }
  if(meaningsEmpty)meaningsEmpty.hidden=!mobile||matching.length>0;
  meaningFilters.forEach(button=>{
    const active=button.dataset.filter===meaningFilter;
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-pressed",String(active));
  });
}

meaningsMore?.addEventListener("click",()=>{
  if(!window.matchMedia("(max-width: 430px)").matches)return;
  meaningsExpanded=!meaningsExpanded;
  updateMeanings();
});
meaningFilters.forEach(button=>button.addEventListener("click",()=>{
  if(!window.matchMedia("(max-width: 430px)").matches)return;
  meaningFilter=button.dataset.filter;
  meaningsExpanded=false;
  updateMeanings();
}));
if(meaningsCatalog){
  updateMeanings();
  window.addEventListener("resize",updateMeanings);
}
