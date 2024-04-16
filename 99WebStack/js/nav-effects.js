// 导航链接淡入淡出效果
window.onload = function() {
    var navLinks = document.querySelectorAll('.nav-grid .nav-link');
    
    navLinks.forEach(function(link) {
      link.addEventListener('mouseover', function() {
        this.style.opacity = '0.8';
      });
      
      link.addEventListener('mouseout', function() {
        this.style.opacity = '1';
      });
    });
  };