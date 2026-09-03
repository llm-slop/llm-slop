/* Shared nav menu. Every page carries the same panel, so each of the real
   pages is one click from every other one. */
(function(){
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('menu');
  if(!btn || !menu) return;

  function set(open){
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  }
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    set(menu.hidden);
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && !menu.hidden){ set(false); btn.focus(); }
  });
  document.addEventListener('click', function(e){
    if(!menu.hidden && !menu.contains(e.target)) set(false);
  });
  menu.addEventListener('click', function(e){
    if(e.target.tagName === 'A') set(false);
  });
})();
