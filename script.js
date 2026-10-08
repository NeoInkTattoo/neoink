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

  const meaningDialog=document.querySelector(".meaning-modal-dialog");

  if(viewport>=769&&viewport<1920){
    const scale=viewport/1920;
    siteShell.style.transform=`scale(${scale})`;
    document.body.style.height=`${Math.ceil(siteShell.scrollHeight*scale)}px`;
    if(meaningDialog)meaningDialog.style.transform=`scale(${scale})`;
  }else{
    siteShell.style.transform="";
    document.body.style.height="";
    if(meaningDialog)meaningDialog.style.transform="";
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
const homePortfolioMobile=window.matchMedia("(max-width: 480px)");

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
let portfolioPages=1;

function updatePortfolio(){
  if(!portfolioGallery)return;
  const pageSize=window.matchMedia("(max-width: 480px)").matches?6:9;
  const matches=portfolioImages.filter(img=>portfolioFilter==="all"||img.dataset.tags?.split(" ").includes(portfolioFilter));
  const visible=matches.slice(0,portfolioPages*pageSize);
  portfolioImages.forEach(img=>{
    const show=visible.includes(img);
    img.parentElement.hidden=!show;
    if(show&&img.dataset.src){
      img.srcset=img.dataset.srcset;
      img.src=img.dataset.src;
      delete img.dataset.src;
      delete img.dataset.srcset;
    }
  });
  if(portfolioMore){
    portfolioMore.hidden=visible.length>=matches.length;
    portfolioMore.setAttribute("aria-expanded",String(portfolioPages>1));
  }
  if(portfolioEmpty)portfolioEmpty.hidden=matches.length>0;
  portfolioFilters.forEach(button=>{
    const active=button.dataset.filter===portfolioFilter;
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-pressed",String(active));
  });
  requestAnimationFrame(updateDesktopScale);
}

portfolioMore?.addEventListener("click",()=>{
  portfolioPages++;
  updatePortfolio();
});

portfolioFilters.forEach(button=>button.addEventListener("click",()=>{
  portfolioFilter=button.dataset.filter;
  portfolioPages=1;
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
const meaningFilterParam=new URLSearchParams(window.location.search).get("filter");
const allowedMeaningFilters=new Set(["all","animals","plants","spiritual","symbols","words","other"]);
let meaningFilter=allowedMeaningFilters.has(meaningFilterParam)?meaningFilterParam:"all";
let meaningsExpanded=false;

function updateMeanings(){
  if(!meaningsCatalog)return;

  const mobile=window.matchMedia("(max-width: 480px)").matches;
  const tablet=window.matchMedia("(min-width: 481px) and (max-width: 768px)").matches;
  const matching=meaningCards.filter(card=>meaningFilter==="all"||card.dataset.category===meaningFilter);

  meaningFilters.forEach(button=>{
    const active=button.dataset.filter===meaningFilter;
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-pressed",String(active));
  });

  if(mobile){
    meaningsCatalog.style.height="";
    meaningCards.forEach(card=>{
      card.style.left="";
      card.style.top="";
      card.hidden=!matching.includes(card)||(meaningFilter==="all"&&!meaningsExpanded&&!card.classList.contains("is-featured"));
    });
    if(meaningsMore){
      meaningsMore.hidden=meaningFilter!=="all"||meaningCards.length<=4;
      meaningsMore.setAttribute("aria-expanded",String(meaningsExpanded));
      meaningsMore.textContent=meaningsExpanded?"Свернуть":"Показать ещё";
    }
  }else{
    meaningsExpanded=false;
    if(meaningsMore)meaningsMore.hidden=true;

    if(meaningFilter==="all"){
      meaningCards.forEach(card=>{
        card.hidden=false;
        card.style.left="";
        card.style.top="";
      });
      meaningsCatalog.style.height="";
    }else{
      meaningCards.forEach(card=>card.hidden=!matching.includes(card));

      const lefts=tablet?[0,246,492]:[0,614,1228];
      const topStart=tablet?147:113;
      const gap=tablet?10:30;
      const columns=[topStart,topStart,topStart];

      matching.forEach(card=>{
        const col=columns.indexOf(Math.min(...columns));
        card.style.left=lefts[col]+"px";
        card.style.top=columns[col]+"px";
        columns[col]+=card.offsetHeight+gap;
      });

      const contentBottom=Math.max(...columns)-gap;
      meaningsCatalog.style.height=Math.max(tablet?520:760,contentBottom+20)+"px";
    }
  }

  if(meaningsEmpty)meaningsEmpty.hidden=matching.length>0;
}

meaningsMore?.addEventListener("click",()=>{
  if(!window.matchMedia("(max-width: 480px)").matches)return;
  meaningsExpanded=!meaningsExpanded;
  updateMeanings();
});

meaningFilters.forEach(button=>button.addEventListener("click",()=>{
  meaningFilter=button.dataset.filter;
  meaningsExpanded=false;
  const url=new URL(window.location.href);
  if(meaningFilter==="all")url.searchParams.delete("filter");else url.searchParams.set("filter",meaningFilter);
  history.replaceState(null,"",url);
  updateMeanings();
}));

if(meaningsCatalog){
  updateMeanings();
  window.addEventListener("resize",updateMeanings);
}

const reviewsCarousel=document.querySelector('.review-carousel');
if(reviewsCarousel){
  const stage=reviewsCarousel.querySelector('.reviews-stage');
  const slides=[...stage.querySelectorAll('.review-slide')];
  const status=reviewsCarousel.querySelector('.review-status');
  let current=1;
  let touchStart=null;
  function showReview(index,announce=false){
    current=(index+slides.length)%slides.length;
    slides.forEach((slide,i)=>{
      slide.classList.toggle('is-current',i===current);
      slide.classList.toggle('is-before',i===(current-1+slides.length)%slides.length);
      slide.classList.toggle('is-after',i===(current+1)%slides.length);
      slide.setAttribute('aria-hidden',String(i!==current));
    });
    if(announce)status.textContent=`Отзыв ${current+1} из ${slides.length}: ${slides[current].querySelector('h3').textContent}`;
  }
  reviewsCarousel.querySelector('.review-prev').addEventListener('click',()=>showReview(current-1,true));
  reviewsCarousel.querySelector('.review-next').addEventListener('click',()=>showReview(current+1,true));
  stage.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();
    showReview(current+(event.key==='ArrowRight'?1:-1),true);
  });
  stage.addEventListener('touchstart',event=>{
    const t=event.touches[0];touchStart={x:t.clientX,y:t.clientY};
  },{passive:true});
  stage.addEventListener('touchend',event=>{
    if(!touchStart)return;
    const t=event.changedTouches[0],dx=t.clientX-touchStart.x,dy=t.clientY-touchStart.y;
    touchStart=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)showReview(current+(dx<0?1:-1),true);
  },{passive:true});
  stage.addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});
  showReview(current);
}


const meaningModal=document.querySelector("#meaning-modal");
const meaningModalTitle=meaningModal?.querySelector("#meaning-modal-title");
const meaningModalCategory=meaningModal?.querySelector(".meaning-modal-category");
const meaningModalLead=meaningModal?.querySelector(".meaning-modal-lead");
const meaningModalContent=meaningModal?.querySelector(".meaning-modal-content");
const meaningModalImage=meaningModal?.querySelector(".meaning-modal-image");
const meaningModalMore=meaningModal?.querySelector(".meaning-modal-more");
let meaningModalTrigger=null;

function closeMeaningModal(){
  if(!meaningModal||meaningModal.hidden)return;
  meaningModal.hidden=true;
  document.body.classList.remove("meaning-modal-open");
  meaningModalTrigger?.focus?.();
}

async function openMeaningModal(link){
  if(!meaningModal)return;
  meaningModalTrigger=link;
  const title=link.querySelector("h3")?.textContent?.trim()||"Значение татуировки";
  const category=link.querySelector(".meaning-category")?.textContent?.trim()||"";
  const cardText=link.querySelector(".meaning-copy p")?.textContent?.trim()||"";
  const cardImage=link.querySelector(".meaning-photo");
  meaningModalTitle.textContent=title;
  meaningModalCategory.textContent=category;
  meaningModalLead.textContent=cardText.replace(/\s+/g," ").replace(/\.\.\.\s*$/,"");
  meaningModalContent.innerHTML="<p>Загружаем подробное значение…</p>";
  meaningModalImage.src=cardImage?.currentSrc||cardImage?.src||"";
  meaningModalImage.alt=cardImage?.alt||title;
  meaningModalMore.href=link.href;
  meaningModal.hidden=false;
  document.body.classList.add("meaning-modal-open");
  meaningModal.querySelector(".meaning-modal-close")?.focus();

  try{
    const response=await fetch(link.href,{credentials:"same-origin"});
    if(!response.ok)throw new Error("Failed to load");
    const html=await response.text();
    const doc=new DOMParser().parseFromString(html,"text/html");
    const pageTitle=doc.querySelector("h1")?.textContent?.trim();
    const pageCategory=doc.querySelector(".detail-category")?.textContent?.trim();
    const pageLead=doc.querySelector(".detail-lead")?.textContent?.trim();
    const detailParagraphs=[...doc.querySelectorAll(".detail-content p")].slice(0,2);
    const pageContent=detailParagraphs.map(p=>p.outerHTML).join("");
    if(pageTitle)meaningModalTitle.textContent=pageTitle.replace(/^Значение татуировки\s*[«"]?|[»"]$/g,"").trim();
    if(pageCategory)meaningModalCategory.textContent=pageCategory;
    if(pageLead)meaningModalLead.textContent=pageLead;
    if(pageContent)meaningModalContent.innerHTML=pageContent;
  }catch(error){
    meaningModalContent.innerHTML="<p>Подробное значение можно открыть на отдельной странице.</p>";
  }
}

document.querySelectorAll("[data-meaning-link]").forEach(link=>{
  link.addEventListener("click",event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    openMeaningModal(link);
  });
});

meaningModal?.querySelectorAll("[data-meaning-close]").forEach(el=>el.addEventListener("click",closeMeaningModal));
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&meaningModal&&!meaningModal.hidden)closeMeaningModal();
});
