from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner
        return obj.uploader == request.user

class IsVideoOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a video to edit it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.uploader == request.user

class IsCommentOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a comment to edit it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class IsProfileOwner(permissions.BasePermission):
    """
    Custom permission to only allow users to edit their own profile.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
