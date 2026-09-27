const menuButton=document.querySelector(".menu-toggle");
const tabletMenu=document.querySelector("#tablet-menu");

function setMenu(open){
  if(!menuButton||!tabletMenu)return;
  menuButton.setAttribute("aria-expanded",String(open));
  menuButton.setAttribute("aria-label",open?"Закрыть меню":"Открыть меню");
  tabletMenu.hidden=!open;
}

menuButton?.addEventListener("click",()=>{
  const open=menuButton.getAttribute("aria-expanded")==="true";
  setMenu(!open);
});

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
