document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('bookingForm');
    const toast = document.getElementById('successToast');
    
    if (!form) return;

    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const serviceSelect = document.getElementById('service');
    const dateInput = document.getElementById('date');

    const nameGroup = nameInput.closest('.form-group');
    const phoneGroup = phoneInput.closest('.form-group');
    const serviceGroup = serviceSelect.closest('.form-group');
    const dateGroup = dateInput.closest('.form-group');

    let busyDates = [];

    function loadBusyDates() {
        const service = serviceSelect.value;
        if (!service) {
            busyDates = [];
            return;
        }
        fetch(`/api/busy-dates/${encodeURIComponent(service)}`)
            .then(res => res.json())
            .then(dates => {
                busyDates = dates;
                console.log('Занятые даты для', service, ':', busyDates);
            })
            .catch(err => console.error('Ошибка загрузки дат:', err));
    }

    serviceSelect.addEventListener('change', loadBusyDates);
    loadBusyDates();

    dateInput.addEventListener('change', function() {
        const selectedDate = this.value;
        if (busyDates.includes(selectedDate)) {
            this.value = '';
            dateGroup.classList.add('invalid');
            setTimeout(() => dateGroup.classList.remove('invalid'), 500);
        }
    });

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
        
        if (busyDates.includes(dateInput.value)) {
            dateInput.value = '';
            return; 
        }

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
            showError(dateGroup, 'Выберите свободную дату');
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

            fetch('/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.error) {
                    dateInput.value = '';
                } else {
                    toast.classList.add('show');
                    form.reset();
                    loadBusyDates();
                    setTimeout(() => {
                        toast.classList.remove('show');
                    }, 4000);
                }
            })
            .catch(error => {
                console.error('Ошибка отправки:', error);
            });
        }
    });
});