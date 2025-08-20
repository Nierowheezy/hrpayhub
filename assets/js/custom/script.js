(function () {
  "use strict";

  // Import Bootstrap
  const bootstrap = window.bootstrap;

  // Initialize when DOM is loaded
  document.addEventListener("DOMContentLoaded", function () {
    try {
      console.log("DOM loaded, initializing...");
      // Set the year with fallback for dynamic content
      const setYear = () => {
        const yearElement = document.getElementById("year");
        if (yearElement) {
          yearElement.textContent = new Date().getFullYear();
          console.log("Year set to:", yearElement.textContent);
        } else {
          console.warn("Year element not found, observing DOM...");
          const observer = new MutationObserver(() => {
            const yearElement = document.getElementById("year");
            if (yearElement) {
              yearElement.textContent = new Date().getFullYear();
              console.log("Year set to:", yearElement.textContent);
              observer.disconnect();
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
        }
      };
      setYear();

      initializeNavigation();
      initializeFormValidation();
      initializeScrollEffects();
      initializeAccessibility();
      initializeOwlCarousel();
    } catch (error) {
      console.error("Error in DOMContentLoaded:", error);
    }
  });

  function initializeNavigation() {
    // Smooth scroll for final links only
    const finalLinks = document.querySelectorAll(
      'a[href^="#"]:not(.dropdown-toggle):not(.submenu-toggle)'
    );
    finalLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const offsetTop = targetElement.offsetTop - 80;
          window.scrollTo({ top: offsetTop, behavior: "smooth" });
          // Collapse navbar on mobile for final links
          if (window.innerWidth < 992) {
            const navbarCollapse = document.querySelector(".navbar-collapse");
            const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
              toggle: false,
            });
            bsCollapse.hide();
          }
        }
      });
    });

    // Submenu toggle
    document.querySelectorAll(".submenu-toggle").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent navbar collapse and parent dropdown issues
        const submenu = this.nextElementSibling;
        submenu.classList.toggle("show");
        // Close other submenus at the same level
        document
          .querySelectorAll(".dropdown-submenu .dropdown-menu")
          .forEach((el) => {
            if (el !== submenu) el.classList.remove("show");
          });
      });
    });

    // Close submenus on outside click, but not on dropdown toggles
    document.addEventListener("click", function (e) {
      if (
        !e.target.closest(".dropdown-submenu") &&
        !e.target.closest(".dropdown")
      ) {
        document
          .querySelectorAll(".dropdown-submenu .dropdown-menu")
          .forEach((el) => el.classList.remove("show"));
      }
    });

    // Prevent navbar collapse from resetting dropdowns/submenus
    const navbarToggler = document.querySelector(".navbar-toggler");
    navbarToggler.addEventListener("click", function () {
      const openDropdowns = document.querySelectorAll(".dropdown-menu.show");
      const openSubmenus = document.querySelectorAll(
        ".dropdown-submenu .dropdown-menu.show"
      );
      setTimeout(() => {
        openDropdowns.forEach((dropdown) => {
          dropdown.classList.add("show");
        });
        openSubmenus.forEach((submenu) => {
          submenu.classList.add("show");
        });
      }, 0);
    });
  }

  /**
   * Form Validation
   */
  function initializeFormValidation() {
    const contactForm = document.querySelector(".contact-form");

    if (contactForm) {
      contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Basic validation
        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!fullName || !email || !message) {
          alert("Please fill in all required fields.");
          return;
        }

        if (!isValidEmail(email)) {
          alert("Please enter a valid email address.");
          return;
        }

        // Simulate form submission
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        setTimeout(function () {
          alert("Thank you for your message! We'll get back to you soon.");
          contactForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 2000);
      });
    }
  }

  /**
   * Scroll Effects
   */
  function initializeScrollEffects() {
    // Navbar background on scroll
    const navbar = document.querySelector(".navbar");

    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 50) {
          navbar.classList.add("shadow-lg");
        } else {
          navbar.classList.remove("shadow-lg");
        }
      },
      { passive: true }
    );

    // Intersection Observer for animations
    if ("IntersectionObserver" in window) {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      };

      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      }, observerOptions);

      // Observe elements for fade-in animation
      const animateElements = document.querySelectorAll(
        ".feature-card, .testimonial-card, .video-card"
      );
      animateElements.forEach(function (element) {
        element.style.opacity = "0";
        element.style.transform = "translateY(30px)";
        element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(element);
      });
    }
  }

  /**
   * Accessibility Enhancements
   */
  function initializeAccessibility() {
    // Enhanced keyboard navigation for dropdowns
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

    dropdownToggles.forEach(function (toggle) {
      toggle.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });

    // Accordion keyboard navigation
    const accordionButtons = document.querySelectorAll(".accordion-button");

    accordionButtons.forEach(function (button) {
      button.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });

    // Video card keyboard navigation
    const videoCards = document.querySelectorAll(".video-card");

    videoCards.forEach(function (card) {
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Play video");

      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // Simulate video play (would integrate with actual video player)
          console.log("Video play triggered");
        }
      });
    });
  }

  /**
   * Owl Carousel Initialization
   */
  function initializeOwlCarousel() {
    const $owl = $("#testimonial-carousel");
    const itemsCount = 3;

    $owl.owlCarousel({
      loop: true,
      center: true,
      items: 1,
      margin: 28,
      autoplay: true,
      autoplayTimeout: 4200,
      autoplayHoverPause: true,
      smartSpeed: 600,
      dots: false,
      nav: false,
      responsive: {
        0: { items: 1, stagePadding: 40 },
        640: { items: 1, stagePadding: 80 },
        992: { items: 1, stagePadding: 280 },
      },
    });

    // Build custom dots
    const $dots = $(".carousel-dots-wrapper");
    for (let i = 0; i < itemsCount; i++) {
      $dots.append(
        $("<button/>", {
          class: "carousel-dot-btn",
          "data-index": i,
          "aria-label": "Go to slide " + (i + 1),
        })
      );
    }

    // Sync dots
    function syncDots() {
      const current =
        $owl
          .find(".owl-item.center .carousel-testimonial-item")
          .data("index") || 0;
      $(".carousel-dot-btn")
        .removeClass("active")
        .eq(current)
        .addClass("active");
    }

    // Initial sync
    setTimeout(syncDots, 100);

    // Update on events
    $owl.on("changed.owl.carousel translated.owl.carousel", function () {
      syncDots();
    });

    // Dot clicks
    $dots.on("click", ".carousel-dot-btn", function () {
      const to = $(this).data("index");
      $owl.trigger("to.owl.carousel", [to, 450, true]);
    });

    // Custom nav
    $(".carousel-next-btn").on("click", () =>
      $owl.trigger("next.owl.carousel")
    );
    $(".carousel-prev-btn").on("click", () =>
      $owl.trigger("prev.owl.carousel")
    );
  }

  /**
   * Utility Functions
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Error handling
  window.addEventListener("error", function (e) {
    console.error("JavaScript Error:", e.error);
  });
})();
