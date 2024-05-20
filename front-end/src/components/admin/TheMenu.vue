<template>
    <nav style="border-right: 1px solid gray;">
        <li>
            <router-link class="logo">
                <img src="../../assets/images/admin_icon.jpg" />
                <span class="nav-item">Admin</span>
            </router-link>
        </li>
        <li>
            <router-link>
                <i class="fas fa-list"></i>
                <span class="nav-item">Môn Học</span>
            </router-link>
        </li>
        <li>
            <router-link>
                <i class="fas fa-user-tie"></i>
                <span class="nav-item">Teachers</span>
            </router-link>
        </li>
        <li>
            <a @click="logout" class="logout">
                <i class="fas fa-sign-out-alt"></i>
                <span class="nav-item">Log out</span>
            </a>
        </li>
    </nav>
</template>
<script>
import { defineComponent } from "vue";
import { storeToRefs } from "pinia";
import { useMenu } from "../../store/use-menu.js";
export default defineComponent({
    setup() {
        const store = useMenu();
        const logout = () => {
            document.cookie = 'accessToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
            document.cookie = 'user_name=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
            delete axios.defaults.headers.common['Authorization'];
            window.location.href = "/admin";
        }
        const { selectedKeys, openKeys } = store;
        return {
            logout,
            ...storeToRefs(store)
        }
    },

});
</script>