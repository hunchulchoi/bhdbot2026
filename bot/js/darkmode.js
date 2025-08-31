const toggleSwitch = document.querySelector('.darkmode-checkbox')
const currentTheme = localStorage.getItem('theme')
const logo = document.querySelector('.logo')

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme)
  
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true
        logo.src = 'assets/img/logo-purple.svg'
    }
}

const switchTheme = (e) => {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark')
        localStorage.setItem('theme', 'dark')
        logo.src = 'assets/img/logo-purple.svg'
    } else {
        document.documentElement.setAttribute('data-theme', 'light')
        localStorage.setItem('theme', 'light')
        logo.src = 'assets/img/logo-orange.svg'
    }    
}

toggleSwitch.addEventListener('change', switchTheme, false)