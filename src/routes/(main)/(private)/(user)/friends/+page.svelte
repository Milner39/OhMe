<script>
    // Import svgs
    import UserAdd from "$lib/assets/svgs/UserAdd.svelte"
    import Search from "$lib/assets/svgs/Search.svelte"
    import Close from "$lib/assets/svgs/Close.svelte"

    // Import components
    import Banner from "$lib/components/Banner.svelte"
    import AutoScroll from "$lib/components/AutoScroll.svelte"
    import LoadingAnimation from "$lib/components/LoadingAnimation.svelte"

    // https://kit.svelte.dev/docs/modules#$app-stores
    // Import `page` to get page data
    import { page } from "$app/stores"

    // https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance
    // "Without an argument, use:enhance will emulate the browser-native behaviour, just without the full-page reloads."
    import { enhance } from "$app/forms"

    // Variable containing all search information
    const search = {
        value: "",
        result: [],
        loading: false
    }

    // Dummy data
    const receivedRequests = ["Molly", "Henry", "Shae", "Bailey", "Jess"]
</script>

<Banner>
    <UserAdd slot="svg"/>
    <h4>Friends</h4>
    <AutoScroll>
        <h6>Send and manage friend requests.</h6>
    </AutoScroll>
</Banner>

<div class="page">
    <div class="widthCtrl">
        <div class="searchBar">
            <Search/>
            <!-- Bind value to `search.value` so it can be accesed by the script -->
            <input class="search" name="search" placeholder="Search for friends..."
                bind:value={search.value}
                on:input={async () => {
                    // Get the `searchValue` when the input was made
                    const initVal = search.value

                    // If the value is empty, return
                    if (initVal === "") {
                        search.result = []
                        return
                    }

                    // Set to true so loading indicator is displayed
                    search.loading = true

                    // Wait 1 second to allow the client to continue typing
                    await new Promise(resolve => setTimeout(resolve, 1000))

                    // If the value has changed, the client is not finished typing so return
                    if (initVal !== search.value) return

                    // Send a request to fetch search results from api endpoint
                    const response = await fetch($page.url.pathname, {
                        method: "POST",
                        body: JSON.stringify({
                            search: search.value
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })

                    // Set `search.result` to the returned users or an empty array
                    search.result = (await response.json()).users || []

                    // Set false when search has loaded
                    search.loading = false
                }}
            >
        </div>
        <!-- Display if client has entered a value in the search input  -->
        {#if search.value}
            <!-- Display if server has returned a search result  -->
            {#if search.result.length > 0}
                <div class="block users" class:loading={search.loading}>
                    <!-- Create a user for every item in `search.result` -->
                    {#each search.result as user, index}
                        <div class="user">
                            <div class="profile">
                                <h6>{user.username}</h6>
                            </div>
                            {#if !user.friendSent}
                                <form method="POST" action="?/friend"
                                    use:enhance={({ formData }) => {
                                        // Add username to `formData`
                                        formData.append("username", user.username)
                                        // Submit form
                                        return async ({ result, update }) => {
                                            // If success
                                            if (result.data.status === 200) {
                                                // Update search results to reflect change
                                                search.result[index].friendSent = true
                                            }
                                            await update()
                                        }
                                    }}
                                >
                                    <button class="button-pill" type="submit">
                                        <UserAdd/>
                                        <h6>Add</h6>
                                    </button>
                                </form>
                            {:else}
                                <form method="POST" action="?/unfriend"
                                    use:enhance={({ formData }) => {
                                        // Add username to `formData`
                                        formData.append("username", user.username)
                                        // Submit form
                                        return async ({ result, update }) => {
                                            // If success
                                            if (result.data.status === 200) {
                                                // Update search results to reflect change
                                                search.result[index].friendSent = false
                                            }
                                            await update()
                                        }
                                    }}
                                >
                                    <button class="button-slim button-svg" type="submit">
                                        <Close/>
                                    </button>
                                </form>
                                <button class="button-pill disabled" type="button">
                                    <UserAdd/>
                                    <h6>Add</h6>
                                </button>
                            {/if}
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="noResult">
                    <!-- Display if server has not returned a response  -->
                    {#if search.loading}
                        <LoadingAnimation/>
                    {:else}
                        <!-- Display if server has returned a response with no results  -->
                        <h6>No results</h6>
                    {/if}
                </div>
            {/if}
        {/if}
        <div class="title">
            <h6>Requests received</h6>
            <h6 class="dim">Requests sent ></h6>
        </div>
        <div class="block users">
            <!-- Create a user for every item in `receivedRequests` -->
            {#each receivedRequests as user}
                <div class="user">
                    <div class="profile">
                        <h6>{user}</h6>
                    </div>
                    <button class="button-slim button-svg" type="submit">
                        <Close/>
                    </button>
                    <button class="button-pill" type="submit">
                        <UserAdd/>
                        <h6>Add</h6>
                    </button>
                </div>
            {/each}
        </div>
    </div>
</div>

<style lang="scss">

    .page {
        display: flex;
        align-items: center;
        justify-content: baseline;
        flex-direction: column;

        gap: 1rem;
    }

    .searchBar {
        width: 100%;
        border-radius: 1000px;
        
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;

        background-color: var(--bg-4);

        >:global(svg) {
            margin-left: 2px;
            height: 1.25rem;
        }

        >.search {
            margin-right: 2px;
            width: 100%;
            border: none;
        }
    }

    .noResult {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        height: 2.5rem;
        font-weight: 600;

        >:global(.animation) {
            color: var(--br-3);
            height: 100%;
        }
    }

    .title {
        width: 100%;

        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;

        font-weight: 600;

        >.dim {
            color: var(--tx-4);
        }
    }

    .block {
        width: 100%;
        padding: 0;
    }

    .users {
        gap: 0;

        &.loading {
            opacity: 0.5;
            // Slowly fade out but instantly fade in
            transition: opacity 200ms ease-in-out;
        }

        >.user {
            position: relative;
            --space: 1rem;

            padding: 0 var(--space);
            margin-top: var(--space);
            margin-bottom: var(--space);

            display: flex;
            align-items: center;
            flex-direction: row;

            gap: 1rem;

            >.profile {
                flex-grow: 1;
            }

            .button-pill {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            :global(svg) {
                height: 1.25rem;
            }
        }

        >.user + .user {
          
            &::before {
                content: "";
                position: absolute;
                left: 0;
                right: 0;

                --size: 1px;
                height: var(--size);
                top: calc(-1 * (var(--space) + var(--size) / 2));

                background-color: var(--bg-4);
            }
        }
    }

    form {
        display: flex;
        align-items: center;
        justify-content: center;
    }


</style>