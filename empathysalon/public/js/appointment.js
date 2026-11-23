document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('bookingForm');
    const toast = document.getElementById('successToast');
    
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const serviceSelect = document.getElementById('service');
    const dateInput = document.getElementById('date');

    const nameGroup = nameInput.closest('.form-group');
    const phoneGroup = phoneInput.closest('.form-group');
    const serviceGroup = serviceSelect.closest('.form-group');
    const dateGroup = dateInput.closest('.form-group');

    const minDate = new Date(2026, 10, 1); 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const actualMinDate = minDate > today ? minDate : today;

    const yyyy = actualMinDate.getFullYear();
    const mm = String(actualMinDate.getMonth() + 1).padStart(2, '0');
    const dd = String(actualMinDate.getDate()).padStart(2, '0');
    const minDateString = `${yyyy}-${mm}-${dd}`;
    dateInput.setAttribute('min', minDateString);

    function showError(group, message) {
        group.classList.add('invalid');
        const errorSpan = group.querySelector('.error-msg');
        if (errorSpan) errorSpan.textContent = message;
    }

    function clearError(group) {
        group.classList.remove('invalid');
        const errorSpan = group.querySelector('.error-msg');
        if (errorSpan) errorSpan.textContent = '';
    }

    function isSunday(dateString) {
        const date = new Date(dateString);
        return date.getDay() === 0;
    }

    dateInput.addEventListener('input', function() {
        if (this.value && isSunday(this.value)) {
            showError(dateGroup, 'По воскресеньям мы не работаем');
            this.value = '';
        } else {
            clearError(dateGroup);
        }
    });

    phoneInput.addEventListener('input', function() {
        let input = this.value.replace(/\D/g, '');
        let formatted = '';
        if (input.length > 0) {
            formatted = '+7';
            if (input.length > 1) formatted += ' (' + input.substring(1, 4);
            if (input.length > 4) formatted += ') ' + input.substring(4, 7);
            if (input.length > 7) formatted += '-' + input.substring(7, 9);
            if (input.length > 9) formatted += '-' + input.substring(9, 11);
        }
        this.value = formatted;
    });

    nameInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^а-яА-Яa-zA-ZёЁ\s-]/g, '');
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault(); 
        let isValid = true;

        if (nameInput.value.trim().length < 2) {
            showError(nameGroup, 'Введите корректное имя');
            isValid = false;
        } else {
            clearError(nameGroup);
        }

        const phoneDigits = phoneInput.value.replace(/\D/g, '');
        if (phoneDigits.length !== 11) {
            showError(phoneGroup, 'Введите полный номер');
            isValid = false;
        } else {
            clearError(phoneGroup);
        }

        if (serviceSelect.value === "") {
            showError(serviceGroup, 'Выберите услугу');
            isValid = false;
        } else {
            clearError(serviceGroup);
        }

        if (!dateInput.value || dateInput.value < minDateString) {
            showError(dateGroup, 'Выберите корректную дату');
            isValid = false;
        } else if (isSunday(dateInput.value)) {
            showError(dateGroup, 'По воскресеньям мы не работаем');
            isValid = false;
        } else {
            clearError(dateGroup);
        }

        if (isValid) {
            const data = {
                name: nameInput.value,
                phone: phoneInput.value,
                service: serviceSelect.value,
                date: dateInput.value
            };

            console.log("Данные для БД:", data);
            
            toast.classList.add('show');
            form.reset();

            setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        }
    });

    [nameInput, phoneInput, serviceSelect, dateInput].forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.form-group');
            if (group.classList.contains('invalid')) {
                clearError(group);
            }
        });
        input.addEventListener('change', () => {
            const group = input.closest('.form-group');
            if (group.classList.contains('invalid')) {
                clearError(group);
            }
        });
    });
});