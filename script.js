const menuButton=document.querySelector(".menu-toggle");
menuButton?.addEventListener("click",()=>{
  const open=menuButton.getAttribute("aria-expanded")==="true";
  menuButton.setAttribute("aria-expanded",String(!open));
  menuButton.textContent=open?"Menu":"Close";
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
}

updateDesktopScale();
window.addEventListener("resize",updateDesktopScale);
window.addEventListener("load",updateDesktopScale);
