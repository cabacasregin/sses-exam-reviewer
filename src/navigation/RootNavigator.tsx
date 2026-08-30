import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LearnerAuthScreen } from '../screens/LearnerAuthScreen';
import { TeacherAuthScreen } from '../screens/TeacherAuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SubjectSetsScreen } from '../screens/SubjectSetsScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { TeacherDashboardScreen } from '../screens/teacher/TeacherDashboardScreen';
import { TeacherContentScreen } from '../screens/teacher/TeacherContentScreen';
import { TeacherSubjectSetsScreen } from '../screens/teacher/TeacherSubjectSetsScreen';
import { TeacherQuestionsScreen } from '../screens/teacher/TeacherQuestionsScreen';
import { TeacherQuestionEditorScreen } from '../screens/teacher/TeacherQuestionEditorScreen';
import { TeacherLearnersScreen } from '../screens/teacher/TeacherLearnersScreen';
import { TeacherLearnerDetailScreen } from '../screens/teacher/TeacherLearnerDetailScreen';
import { TeacherItemAnalysisScreen } from '../screens/teacher/TeacherItemAnalysisScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '700' as const },
};

export function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!session ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LearnerAuth" component={LearnerAuthScreen} options={{ title: 'Log In' }} />
            <Stack.Screen name="TeacherAuth" component={TeacherAuthScreen} options={{ title: 'Teacher Login' }} />
          </>
        ) : session.role === 'teacher' ? (
          <>
            <Stack.Screen
              name="TeacherDashboard"
              component={TeacherDashboardScreen}
              options={{ title: 'Teacher Portal' }}
            />
            <Stack.Screen name="TeacherContent" component={TeacherContentScreen} options={{ title: 'Review Content' }} />
            <Stack.Screen
              name="TeacherSubjectSets"
              component={TeacherSubjectSetsScreen}
              options={{ title: 'Practice Sets' }}
            />
            <Stack.Screen name="TeacherQuestions" component={TeacherQuestionsScreen} options={{ title: 'Questions' }} />
            <Stack.Screen
              name="TeacherQuestionEditor"
              component={TeacherQuestionEditorScreen}
              options={{ title: 'Edit Question' }}
            />
            <Stack.Screen
              name="TeacherLearners"
              component={TeacherLearnersScreen}
              options={{ title: 'Learner Progress' }}
            />
            <Stack.Screen
              name="TeacherLearnerDetail"
              component={TeacherLearnerDetailScreen}
              options={{ title: 'Learner Detail' }}
            />
            <Stack.Screen
              name="TeacherItemAnalysis"
              component={TeacherItemAnalysisScreen}
              options={{ title: 'Item Analysis' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Exam Reviewer' }} />
            <Stack.Screen name="SubjectSets" component={SubjectSetsScreen} options={{ title: 'Practice Sets' }} />
            <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{ title: 'Results', headerBackVisible: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
