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
  }else{
    siteShell.style.transform="";
    document.body.style.height="";
  }

  if(meaningDialog){
    const popupScale=Math.min(1,viewport/1920,(window.innerHeight-48)/700);
    meaningDialog.style.transform=viewport>1024?`scale(${Math.max(0.1,popupScale)})`:"";
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


const portfolioViewer=document.querySelector("#portfolio-viewer");
if(portfolioViewer&&portfolioGallery){
  const photo=portfolioViewer.querySelector(".portfolio-viewer-photo");
  const counter=portfolioViewer.querySelector(".portfolio-viewer-counter");
  const previous=portfolioViewer.querySelector(".portfolio-viewer-prev");
  const next=portfolioViewer.querySelector(".portfolio-viewer-next");
  let viewerItems=[];
  let viewerIndex=0;
  let viewerTrigger=null;
  let restoreKeyboardFocus=false;
  let lastSwipeAt=0;
  let backdropPointer=false;
  let touchStart=null;
  let nextPhoto=null;

  function fullPhotoSource(img){
    const sources=(img.dataset.srcset||img.getAttribute("srcset")||"").split(",").map(source=>source.trim().split(/\s+/));
    const largest=sources.reduce((best,source)=>parseInt(source[1]||0)>parseInt(best[1]||0)?source:best,["",0]);
    return largest[0]||img.dataset.src||img.getAttribute("src");
  }

  function showPortfolioPhoto(index){
    viewerIndex=(index+viewerItems.length)%viewerItems.length;
    const current=viewerItems[viewerIndex];
    photo.alt=current.alt;
    photo.src=fullPhotoSource(current);
    counter.textContent=`${viewerIndex+1} / ${viewerItems.length}`;
    previous.hidden=next.hidden=viewerItems.length<2;
    // Fetch just the next image after opening, never the whole gallery.
    if(viewerItems.length>1){
      nextPhoto=new Image();
      nextPhoto.decoding="async";
      nextPhoto.src=fullPhotoSource(viewerItems[(viewerIndex+1)%viewerItems.length]);
    }
  }

  function openPortfolioViewer(img,event){
    if(portfolioViewer.open)return;
    viewerItems=portfolioImages.filter(item=>portfolioFilter==="all"||item.dataset.tags?.split(" ").includes(portfolioFilter));
    viewerTrigger=img.closest(".portfolio-item");
    restoreKeyboardFocus=event.detail===0;
    showPortfolioPhoto(viewerItems.indexOf(img));
    portfolioViewer.showModal();
    document.documentElement.classList.add("portfolio-viewer-open");
  }

  portfolioImages.forEach(img=>{
    const trigger=img.closest(".portfolio-item");
    trigger.setAttribute("aria-label",`Открыть фото: ${img.alt}`);
    trigger.setAttribute("aria-haspopup","dialog");
    trigger.setAttribute("aria-controls","portfolio-viewer");
    img.draggable=false;
    trigger.addEventListener("click",event=>{
      event.stopPropagation();
      openPortfolioViewer(img,event);
    });
  });

  previous.addEventListener("click",()=>showPortfolioPhoto(viewerIndex-1));
  next.addEventListener("click",()=>showPortfolioPhoto(viewerIndex+1));
  portfolioViewer.querySelector(".portfolio-viewer-close").addEventListener("click",()=>portfolioViewer.close());
  function outsidePhoto(event){
    if(event.target.closest("button"))return false;
    if(!photo.naturalWidth)return event.target!==photo;
    // Exclude only the visible photo, not the empty object-fit margins.
    const rect=photo.getBoundingClientRect();
    const scale=Math.min(rect.width/photo.naturalWidth,rect.height/photo.naturalHeight);
    const width=photo.naturalWidth*scale,height=photo.naturalHeight*scale;
    const left=rect.left+(rect.width-width)/2,top=rect.top+(rect.height-height)/2;
    return event.clientX<left||event.clientX>left+width||event.clientY<top||event.clientY>top+height;
  }
  portfolioViewer.addEventListener("pointerdown",event=>{
    backdropPointer=outsidePhoto(event);
  });
  portfolioViewer.addEventListener("click",event=>{
    const dismiss=backdropPointer&&outsidePhoto(event)&&Date.now()-lastSwipeAt>=350;
    backdropPointer=false;
    if(dismiss)portfolioViewer.close();
  });
  portfolioViewer.addEventListener("keydown",event=>{
    if(event.key==="ArrowLeft"||event.key==="ArrowRight"){
      event.preventDefault();
      showPortfolioPhoto(viewerIndex+(event.key==="ArrowRight"?1:-1));
    }
  });
  portfolioViewer.addEventListener("close",()=>{
    document.documentElement.classList.remove("portfolio-viewer-open");
    photo.removeAttribute("src");
    nextPhoto=null;
    backdropPointer=false;
    touchStart=null;
    if(restoreKeyboardFocus)viewerTrigger?.focus({preventScroll:true});
    else viewerTrigger?.blur();
  });
  photo.addEventListener("touchstart",event=>{
    touchStart=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;
  },{passive:true});
  photo.addEventListener("touchend",event=>{
    if(!touchStart||event.touches.length)return;
    const touch=event.changedTouches[0];
    const dx=touch.clientX-touchStart.x;
    const dy=touch.clientY-touchStart.y;
    touchStart=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4){
      lastSwipeAt=Date.now();
      showPortfolioPhoto(viewerIndex+(dx<0?1:-1));
    }
  },{passive:true});
  photo.addEventListener("touchcancel",()=>{touchStart=null;},{passive:true});
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

  if(mobile||tablet){
    if(tablet)meaningsExpanded=false;
    meaningsCatalog.style.height="";
    meaningCards.forEach(card=>{
      card.style.left="";
      card.style.top="";
      card.hidden=!matching.includes(card)||(mobile&&meaningFilter==="all"&&!meaningsExpanded&&!card.classList.contains("is-featured"));
    });
    if(meaningsMore){
      meaningsMore.hidden=tablet||meaningFilter!=="all"||meaningCards.length<=4;
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

let meaningPreviewHTML="";
function setMeaningPreviewContent(html){
  meaningPreviewHTML=html;
  meaningModalContent.innerHTML=html;
}
function fitMeaningPreview(){
  if(!meaningModal||meaningModal.hidden||!meaningModalContent||!meaningPreviewHTML)return;
  meaningModalContent.innerHTML=meaningPreviewHTML;
  const text=[...meaningModalContent.querySelectorAll("p")].map(p=>p.textContent.trim()).join(" ").replace(/\s+/g," ").trim();
  const paragraph=document.createElement("p");
  paragraph.textContent=text;
  meaningModalContent.replaceChildren(paragraph);
  const lineHeight=parseFloat(getComputedStyle(meaningModalContent).lineHeight)||20;
  const available=Math.floor(meaningModalContent.clientHeight/lineHeight)*lineHeight;
  if(available<lineHeight){paragraph.textContent="";return;}
  const fits=()=>paragraph.offsetHeight<=available+0.5;
  if(fits())return;
  const words=text.split(" ");
  let low=0,high=words.length-1;
  while(low<high){
    const middle=Math.ceil((low+high)/2);
    paragraph.textContent=words.slice(0,middle).join(" ").replace(/[\s,;:—–.-]+$/u,"")+"…";
    if(fits())low=middle;
    else high=middle-1;
  }
  paragraph.textContent=words.slice(0,low).join(" ").replace(/[\s,;:—–.-]+$/u,"")+"…";
}
window.addEventListener("resize",()=>requestAnimationFrame(fitMeaningPreview));
document.fonts?.ready.then(()=>requestAnimationFrame(fitMeaningPreview));

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
  setMeaningPreviewContent("<p>Загружаем подробное значение…</p>");
  meaningModalImage.src=cardImage?.currentSrc||cardImage?.src||"";
  meaningModalImage.alt=cardImage?.alt||title;
  meaningModalMore.href=link.href;
  meaningModal.hidden=false;
  document.body.classList.add("meaning-modal-open");
  meaningModal.querySelector(".meaning-modal-close")?.focus();
  requestAnimationFrame(fitMeaningPreview);

  try{
    const response=await fetch(link.href,{credentials:"same-origin"});
    if(!response.ok)throw new Error("Failed to load");
    const html=await response.text();
    const doc=new DOMParser().parseFromString(html,"text/html");
    const pageTitle=doc.querySelector("h1")?.textContent?.trim();
    const pageCategory=doc.querySelector(".detail-category")?.textContent?.trim();
    const pageLead=doc.querySelector(".detail-lead")?.textContent?.trim();
    const detailParagraphs=[...doc.querySelectorAll(".detail-content p")];
    const pageContent=detailParagraphs.map(p=>p.outerHTML).join("");
    if(pageTitle)meaningModalTitle.textContent=pageTitle.replace(/^Значение татуировки\s*[«"]?|[»"]$/g,"").trim();
    if(pageCategory)meaningModalCategory.textContent=pageCategory;
    if(pageLead)meaningModalLead.textContent=pageLead;
    if(pageContent)setMeaningPreviewContent(pageContent);
  }catch(error){
    setMeaningPreviewContent("<p>Подробное значение можно открыть на отдельной странице.</p>");
  }
  requestAnimationFrame(fitMeaningPreview);
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
