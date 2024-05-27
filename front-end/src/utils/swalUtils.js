// src/utils/swalUtils.js
import Swal from 'sweetalert2';

export const showAlert = async ({ title, text, icon, timer = null, showConfirmButton = true, position = 'center' }) => {
    return await Swal.fire({
        title,
        text,
        icon,
        timer,
        showConfirmButton,
        position,
    });
};

export const showConfirmation = async ({ title, text, confirmButtonText = 'Xóa', cancelButtonText = 'Hủy' }) => {
    return await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText,
        cancelButtonText,
    });
};

export const showWarning = async ({ title, text, position = 'center' }) => {
    return await Swal.fire({
        title,
        text,
        icon: 'warning',
        confirmButtonText: 'OK',
        position
    });
};

export const showSuccess = async ({ title, text, timer = 1000, position = 'center', showConfirmButton = false }) => {
    return await Swal.fire({
        title,
        text,
        timer,
        icon: 'success',
        position,
        showConfirmButton,
    });
};