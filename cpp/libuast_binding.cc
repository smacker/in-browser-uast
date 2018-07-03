#include <cstdint>

#include <iostream>
#include <string>
#include <tuple>
#include <vector>

#include "uast.h"

#include "emscripten.h"

static Uast *ctx;

extern "C"
{
    extern char *getNodeString(int n, char *method);
    extern int getNodeInt(int n, char *method, char *submethod);
    extern bool getNodeBool(int n, char *method);

    extern int getNodeChildrenSize(int n);
    extern int getNodeChildAt(int n, int idx);

    extern int getNodeRolesSize(int n);
    extern int getNodeRoleAt(int n, int idx);
}

static const char *InternalType(const void *node)
{
    return getNodeString(*(int *)(node), (char *)"getInternalType");
}

static const char *Token(const void *node)
{
    return getNodeString(*(int *)(node), (char *)"getToken");
}

static size_t ChildrenSize(const void *node)
{
    return getNodeChildrenSize(*(int *)(node));
}

static void *ChildAt(const void *node, int index)
{
    int *child;
    child = new int; // FIXME need to delete it somewhere
    *child = getNodeChildAt(*(int *)(node), index);
    return child;
}

static size_t RolesSize(const void *node)
{
    return getNodeRolesSize(*(int *)(node));
}

static uint16_t RoleAt(const void *node, int index)
{
    return getNodeRoleAt(*(int *)(node), index);
}

static size_t PropertiesSize(const void *node)
{
    return 0;
}

static const char *PropertyKeyAt(const void *node, int index)
{
    return NULL;
}

static const char *PropertyValueAt(const void *node, int index)
{
    return NULL;
}

static bool HasStartOffset(const void *node)
{
    return getNodeBool(*(int *)(node), (char *)"hasStartPosition");
}

static uint32_t StartOffset(const void *node)
{
    return getNodeInt(*(int *)(node), (char *)"getStartPosition", (char *)"getOffset");
}

static bool HasStartLine(const void *node)
{
    return getNodeBool(*(int *)(node), (char *)"getStartPosition");
}

static uint32_t StartLine(const void *node)
{
    return getNodeInt(*(int *)(node), (char *)"getStartPosition", (char *)"getLine");
}

static bool HasStartCol(const void *node)
{
    return getNodeBool(*(int *)(node), (char *)"getStartPosition");
}

static uint32_t StartCol(const void *node)
{
    return getNodeInt(*(int *)(node), (char *)"getStartPosition", (char *)"getCol");
}

static bool HasEndOffset(const void *node)
{
    return getNodeBool(*(int *)(node), (char *)"hasEndPosition");
}

static uint32_t EndOffset(const void *node)
{
    return getNodeInt(*(int *)(node), (char *)"getEndPosition", (char *)"getOffset");
}

static bool HasEndLine(const void *node)
{
    return getNodeBool(*(int *)(node), (char *)"hasEndPosition");
}

static uint32_t EndLine(const void *node)
{
    return getNodeInt(*(int *)(node), (char *)"getEndPosition", (char *)"getLine");
}

static bool HasEndCol(const void *node)
{
    return getNodeBool(*(int *)(node), (char *)"hasEndPosition");
}

static uint32_t EndCol(const void *node)
{
    return getNodeInt(*(int *)(node), (char *)"getEndPosition", (char *)"getCol");
}

//

#ifdef __cplusplus
extern "C"
{
#endif

    typedef struct
    {
        Nodes *nodes;
        char *error;
    } filter_result;

    filter_result *EMSCRIPTEN_KEEPALIVE filter(int uast, const char *query)
    {
        Uast *ctx = UastNew(NodeIface{
            .InternalType = InternalType,
            .Token = Token,
            .ChildrenSize = ChildrenSize,
            .ChildAt = ChildAt,
            .RolesSize = RolesSize,
            .RoleAt = RoleAt,
            .PropertiesSize = PropertiesSize,
            .PropertyKeyAt = PropertyKeyAt,
            .PropertyValueAt = PropertyValueAt,
            .HasStartOffset = HasStartOffset,
            .StartOffset = StartOffset,
            .HasStartLine = HasStartLine,
            .StartLine = StartLine,
            .HasStartCol = HasStartCol,
            .StartCol = StartCol,
            .HasEndOffset = HasEndOffset,
            .EndOffset = EndOffset,
            .HasEndLine = HasEndLine,
            .EndLine = EndLine,
            .HasEndCol = HasEndCol,
            .EndCol = EndCol,
        });

        printf("query: %s\n", query);

        Nodes *nodes = UastFilter(ctx, &uast, query);

        filter_result result;
        filter_result *result_ptr = &result;

        if (nodes == NULL)
        {
            result_ptr->error = LastError();
        }
        else
        {
            result_ptr->nodes = nodes;
        }

        return result_ptr;
    }

    char *EMSCRIPTEN_KEEPALIVE get_error(filter_result *result)
    {
        return result->error;
    }

    int EMSCRIPTEN_KEEPALIVE get_nodes_size(filter_result *result)
    {
        return NodesSize(result->nodes);
    }

    void *EMSCRIPTEN_KEEPALIVE get_nodes(filter_result *result)
    {
        Nodes *nodes = result->nodes;
        size_t size = NodesSize(nodes);
        // FIXME need to delete it somewhere
        uint8_t *ids = static_cast<uint8_t *>(malloc(size));

        for (size_t i = 0; i < size; i++)
        {
            ids[i] = *(int *)NodeAt(nodes, i);
        }

        return ids;
    }

    // I'm not sure it works correctly
    void EMSCRIPTEN_KEEPALIVE free_filter(filter_result *result)
    {

        NodesFree(result->nodes);
        free(result->error);

        if (result != nullptr)
        {
            delete result;
            result = nullptr;
        }

        UastFree(ctx);
    }

#ifdef __cplusplus
}
#endif
