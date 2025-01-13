const toggle = document.querySelector('.header-toggle');
const header = document.querySelector('.header');

toggle.onclick = () => {
  header.classList.toggle('active');
}