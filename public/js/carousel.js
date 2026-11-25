document.addEventListener("DOMContentLoaded", function() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!track) return;

    const cards = Array.from(track.children);
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });

    let currentIndex = 0;
    const cardWidth = 595;
    const totalOriginalCards = cards.length;

    function updateCarousel() {
        track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }

    function handleNext() {
        currentIndex++;
        if (currentIndex >= totalOriginalCards) {
            updateCarousel();
            setTimeout(() => {
                track.style.transition = 'none';
                currentIndex = 0;
                track.style.transform = `translateX(0px)`;
            }, 400);
        } else {
            updateCarousel();
        }
    }

    function handlePrev() {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = totalOriginalCards - 1;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            setTimeout(() => {
                updateCarousel();
            }, 20);
        } else {
            updateCarousel();
        }
    }

    nextBtn.addEventListener('click', handleNext);
    prevBtn.addEventListener('click', handlePrev);

    window.addEventListener('resize', () => {
        updateCarousel();
    });
});