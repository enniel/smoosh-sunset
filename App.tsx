import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { User } from "./types";

const Stack = createNativeStackNavigator();

const USERS_API_URL = "https://jsonplaceholder.typicode.com/users";
const POSTS_API_URL = "https://jsonplaceholder.typicode.com/posts";
const COMMENTS_API_URL = "https://jsonplaceholder.typicode.com/comments";

// Экран списка пользователей
function UsersListScreen({ navigation }: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch(USERS_API_URL);
      const data: User[] = await response.json();
      setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate("UserPosts", { user: item })}
    >
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
      <Text style={styles.userUsername}>@{item.username}</Text>
      <Text style={styles.userCompany}>{item.company.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

// Экран постов пользователя
function UserPostsScreen({ route, navigation }: any) {
  const { user } = route.params;
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      // Загружаем все посты
      const response = await fetch(POSTS_API_URL);
      const data: any[] = await response.json();
      // Фильтруем посты текущего пользователя
      const userPosts = data.filter((post) => post.userId === user.id);
      setPosts(userPosts);
      setLoading(false);
    };

    fetchPosts();
  }, [user.id]);

  const renderPostItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() =>
        navigation.navigate("PostComments", { post: item, userName: user.name })
      }
    >
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postBody} numberOfLines={3}>
        {item.body}
      </Text>
      <Text style={styles.postId}>Post #{item.id}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts found</Text>
          </View>
        }
      />
    </View>
  );
}

// Экран комментариев к посту
function PostCommentsScreen({ route }: any) {
  const { post, userName } = route.params;
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchComments = async () => {
      // Загружаем все комментарии
      const response = await fetch(COMMENTS_API_URL);
      const data: any[] = await response.json();
      // Фильтруем комментарии к текущему посту
      const postComments = data.filter((comment) => comment.postId === post.id);
      setComments(postComments);
      setLoading(false);
    };

    fetchComments();
  }, [post.id]);

  const renderCommentItem = ({ item }: any) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentName}>{item.name}</Text>
        <Text style={styles.commentEmail}>{item.email}</Text>
      </View>
      <Text style={styles.commentBody}>{item.body}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading comments...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.postDetailCard}>
        <Text style={styles.postDetailTitle}>{post.title}</Text>
        <Text style={styles.postDetailBody}>{post.body}</Text>
        <Text style={styles.postAuthor}>By: {userName}</Text>
      </View>
      <View style={styles.commentsHeader}>
        <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
      </View>
      <FlatList
        data={comments}
        renderItem={renderCommentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No comments found</Text>
          </View>
        }
      />
    </View>
  );
}

// Главный компонент приложения
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="UsersList"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#3498db",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="UsersList"
          component={UsersListScreen}
          options={{ title: "Users" }}
        />
        <Stack.Screen
          name="UserPosts"
          component={UserPostsScreen}
          options={({ route }: any) => ({
            title: route.params.user.name + "'s Posts",
          })}
        />
        <Stack.Screen
          name="PostComments"
          component={PostCommentsScreen}
          options={{ title: "Comments" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#7f8c8d",
  },
  listContainer: {
    padding: 8,
  },
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 14,
    color: "#3498db",
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  userCompany: {
    fontSize: 14,
    color: "#95a5a6",
    fontStyle: "italic",
  },
  postCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  postBody: {
    fontSize: 14,
    color: "#34495e",
    lineHeight: 20,
    marginBottom: 8,
  },
  postId: {
    fontSize: 12,
    color: "#95a5a6",
    marginTop: 8,
  },
  postDetailCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    margin: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postDetailTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  postDetailBody: {
    fontSize: 16,
    color: "#34495e",
    lineHeight: 24,
    marginBottom: 8,
  },
  postAuthor: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "600",
    marginTop: 8,
  },
  commentsHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  commentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  commentHeader: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  commentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  commentEmail: {
    fontSize: 12,
    color: "#3498db",
  },
  commentBody: {
    fontSize: 14,
    color: "#34495e",
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
  },
});
