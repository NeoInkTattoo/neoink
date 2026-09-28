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
