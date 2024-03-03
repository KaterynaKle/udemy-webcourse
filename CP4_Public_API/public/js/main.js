const currentLocation = window.location.href;
console.log(currentLocation);
const menuItem = document.querySelectorAll('.navitem');

for(let i = 0; i < menuItem.length; i++) {
    if(menuItem[i].href === currentLocation) {
        menuItem[i].className = "active";
    }
}
